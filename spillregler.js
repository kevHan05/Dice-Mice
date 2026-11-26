// Dice-Mice! – spillreglene.
// Brukes bare av serveren (server.js). Ligger utenfor public/, så nettleseren kan ikke laste den ned.
// Serveren bestemmer alt som har med regler og terninger å gjøre. Hver funksjon som endrer spillet,
// gir tilbake en liste med hendelser (kast, flytt, spesialfelt, duell, seier, neste tur).
// Nettleseren spiller av hendelsene i rekkefølge (se spillAv() i public/game.js).

// Brettene man kan velge mellom i lobbyen
const BRETT = {
  kort:   { antallSteg: 30, omganger: 2 },
  vanlig: { antallSteg: 40, omganger: 2.5 },
  lang:   { antallSteg: 55, omganger: 3 },
};

// Spesialfeltene (utseende og tekst ligger i public/game.js)
const SPESIALTYPER = ['frem', 'tilbake', 'igjen', 'over'];
const SPESIAL_STEG = 3;            // hvor langt frem/tilbake spesialfeltene flytter musen
const DUELL_STEG = 2;              // hvor langt vinneren av en duell går frem, og taperen tilbake
const ANDEL_SPESIALFELT = 1 / 6;   // omtrent hvert sjette felt er et spesialfelt

// Et tilfeldig terningkast. I testmodus (se server.js) kan testene bestemme de neste kastene på forhånd.
function terningkast(spill) {
  if (spill.testKast && spill.testKast.length) return spill.testKast.shift();
  return 1 + Math.floor(Math.random() * 6);
}

// Legger spesialfeltene på tilfeldige plasser (nye plasser hver runde)
function plasserSpesialfelt(antallSteg) {
  const spesial = {};
  const kandidater = [];
  for (let i = 2; i < antallSteg - 1; i++) kandidater.push(i); // ikke på START, første felt eller rett før osten
  // Stokker kandidatene (Fisher–Yates)
  for (let i = kandidater.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kandidater[i], kandidater[j]] = [kandidater[j], kandidater[i]];
  }
  const antall = Math.round(antallSteg * ANDEL_SPESIALFELT);
  kandidater.slice(0, antall).forEach((felt, k) => {
    spesial[felt] = SPESIALTYPER[k % SPESIALTYPER.length];
  });
  return spesial;
}

// Et nytt spill for antallSpillere spillere på brettet brettNavn.
// Posisjon 0 = START, antallSteg = osten i midten.
function nyttSpill(antallSpillere, brettNavn) {
  const { antallSteg, omganger } = BRETT[brettNavn];
  const liste = (verdi) => Array.from({ length: antallSpillere }, () => verdi);
  return {
    antallSteg,
    omganger,
    spesial: plasserSpesialfelt(antallSteg),
    posisjoner: liste(0),
    staOver: liste(false),   // sant for en spiller som må stå over neste runde
    ankomst: liste(0),       // når hver mus sist kom til feltet sitt (høyere = senere)
    ankomstTeller: 0,
    aktive: liste(true),     // usant for en spiller som har lukket siden (hoppes over)
    tur: 0,
    ferdig: false,
    duell: null,             // { sider: [a, b], kast: [tall|null, tall|null] } mens to mus duellerer
    kastet: null,            // { verdi, kastIgjen } for kastet som pågår
  };
}

// Flytter mus i et antall felt frem (retning 1) eller tilbake (retning -1)
function flytt(spill, i, antall, retning, hendelser) {
  if (antall <= 0) return;
  spill.posisjoner[i] += antall * retning;
  spill.ankomst[i] = ++spill.ankomstTeller;
  hendelser.push({ type: 'flytt', spiller: i, antall, retning });
}

// Finner musen som mus i skal duellere mot: en annen mus på det samme vanlige feltet
// (ikke START, spesialfelt eller osten). Står flere der, er det den som kom sist. -1 = ingen duell.
function finnMotstander(spill, i) {
  const felt = spill.posisjoner[i];
  if (felt <= 0 || felt >= spill.antallSteg || spill.spesial[felt]) return -1;
  let motstander = -1;
  spill.posisjoner.forEach((p, j) => {
    if (j !== i && p === felt && (motstander < 0 || spill.ankomst[j] > spill.ankomst[motstander])) motstander = j;
  });
  return motstander;
}

// Går videre til neste spiller. Spillere som må stå over, og spillere som har gått, hoppes over.
// Gir tilbake numrene på dem som sto over.
function nesteTur(spill) {
  const stoOver = [];
  const antall = spill.posisjoner.length;
  for (let forsok = 0; forsok < antall * 2 + 1; forsok++) {
    spill.tur = (spill.tur + 1) % antall;
    if (!spill.aktive[spill.tur]) continue;
    if (!spill.staOver[spill.tur]) return stoOver;
    spill.staOver[spill.tur] = false;
    stoOver.push(spill.tur);
  }
  return stoOver;
}

// Spilleren som har tur, kaster terningen. Gir tilbake hendelsene, eller null hvis det ikke er lov nå.
function kast(spill, i) {
  if (spill.ferdig || spill.duell || i !== spill.tur) return null;
  const hendelser = [];
  const verdi = terningkast(spill);
  hendelser.push({ type: 'kast', spiller: i, verdi });
  flytt(spill, i, Math.min(verdi, spill.antallSteg - spill.posisjoner[i]), 1, hendelser);

  // Spesialfelt (det nye feltet musen havner på etterpå, gjør ingenting)
  const felt = spill.posisjoner[i];
  const type = spill.spesial[felt];
  let kastIgjen = false;
  if (type) {
    hendelser.push({ type: 'spesial', spiller: i, felttype: type, felt });
    if (type === 'frem') {
      flytt(spill, i, Math.min(SPESIAL_STEG, spill.antallSteg - spill.posisjoner[i]), 1, hendelser);
    } else if (type === 'tilbake') {
      flytt(spill, i, Math.min(SPESIAL_STEG, spill.posisjoner[i]), -1, hendelser);
    } else if (type === 'igjen') {
      kastIgjen = true;
    } else if (type === 'over') {
      spill.staOver[i] = true;
    }
  }
  spill.kastet = { verdi, kastIgjen };

  // Museduell: ender musen på et vanlig felt der en annen mus står (også etter ⏩ eller ⏪).
  // Da venter turen til begge har kastet (se duellKast).
  const motstander = finnMotstander(spill, i);
  if (motstander >= 0) {
    spill.duell = { sider: [i, motstander], kast: [null, null] };
    hendelser.push({ type: 'duellStart', a: i, b: motstander });
    kastForBorte(spill, hendelser);
    return hendelser;
  }

  avsluttTur(spill, hendelser);
  return hendelser;
}

// En av de to i duellen kaster sin terning (side 0 = den som har tur, side 1 = motstanderen).
// Gir tilbake hendelsene, eller null hvis det ikke er lov nå.
function duellKast(spill, side) {
  if (!spill.duell || spill.duell.kast[side] !== null) return null;
  const hendelser = [];
  kastForSide(spill, side, hendelser);
  return hendelser;
}

function kastForSide(spill, side, hendelser) {
  const d = spill.duell;
  const verdi = terningkast(spill);
  d.kast[side] = verdi;
  hendelser.push({ type: 'duellKast', side, spiller: d.sider[side], verdi });
  if (d.kast.includes(null)) return; // venter på den andre

  const [kastA, kastB] = d.kast;
  if (kastA === kastB) {
    // Likt: begge kaster på nytt
    hendelser.push({ type: 'duellLikt' });
    d.kast = [null, null];
    kastForBorte(spill, hendelser);
    return;
  }

  // Høyest går DUELL_STEG frem, lavest like mange tilbake.
  // Havner de på et spesialfelt eller hos en annen mus etterpå, skjer det ingenting.
  const [a, b] = d.sider;
  const [vinner, taper] = kastA > kastB ? [a, b] : [b, a];
  const frem = Math.min(DUELL_STEG, spill.antallSteg - spill.posisjoner[vinner]);
  const tilbake = Math.min(DUELL_STEG, spill.posisjoner[taper]);
  spill.duell = null;
  hendelser.push({ type: 'duellFerdig', vinner, taper, frem, tilbake });
  flytt(spill, vinner, frem, 1, hendelser);
  flytt(spill, taper, tilbake, -1, hendelser);
  if (spill.posisjoner[vinner] < spill.antallSteg) hendelser.push({ type: 'duellGlad', spiller: vinner });
  avsluttTur(spill, hendelser);
}

// Har en av musene i duellen gått fra spillet, kaster serveren for den, så duellen ikke stopper opp
function kastForBorte(spill, hendelser) {
  for (let side = 0; side < 2; side++) {
    const d = spill.duell;
    if (d && d.kast[side] === null && !spill.aktive[d.sider[side]]) kastForSide(spill, side, hendelser);
  }
}

// Etter kastet (og en eventuell duell): seier, sekser eller neste spiller
function avsluttTur(spill, hendelser) {
  // Den som er ved osten, har vunnet – i en duell kan det være en annen enn den som har tur
  const vinnerNr = spill.posisjoner.findIndex((p) => p >= spill.antallSteg);
  const { verdi, kastIgjen } = spill.kastet;
  spill.kastet = null;

  if (vinnerNr >= 0) {
    spill.ferdig = true;
    spill.tur = vinnerNr;
    hendelser.push({ type: 'seier', spiller: vinnerNr });
    return;
  }

  // Slår man 6, får man kaste igjen (hver gang). Lander man på 🎲 med en sekser, blir det bare ett ekstra kast.
  let igjen = kastIgjen;
  if (verdi === 6 && !igjen) {
    igjen = true;
    hendelser.push({ type: 'sekser', spiller: spill.tur });
  }
  // Har spilleren gått fra spillet, får den ikke kaste igjen
  if (igjen && spill.aktive[spill.tur]) {
    hendelser.push({ type: 'nesteTur', tur: spill.tur, stoOver: [] });
    return;
  }
  const stoOver = nesteTur(spill);
  hendelser.push({ type: 'nesteTur', tur: spill.tur, stoOver });
}

// En spiller har lukket siden midt i spillet. Musen blir stående, men turene hoppes over.
// Gir tilbake hendelsene som trengs for at spillet kan fortsette (tom liste hvis ingen).
function spillerBorte(spill, i) {
  spill.aktive[i] = false;
  const hendelser = [];
  if (spill.ferdig) return hendelser;
  if (spill.duell) {
    kastForBorte(spill, hendelser);
  } else if (spill.tur === i) {
    const stoOver = nesteTur(spill);
    hendelser.push({ type: 'nesteTur', tur: spill.tur, stoOver });
  }
  return hendelser;
}

module.exports = { BRETT, nyttSpill, kast, duellKast, spillerBorte };
