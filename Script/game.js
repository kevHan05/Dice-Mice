// Dice-Mice! – første utkast (prototype)

// ---------- Innstillinger ----------
const ANTALL_STEG = 40;      // steg på spiralen, inkludert START
// Spiller 1 får første farge, spiller 2 den andre osv. Navnet brukes hvis spilleren ikke skriver inn noe.
const MUSER = [
  { navn: 'Grå mus',   farge: '#9a9a9a' },
  { navn: 'Brun mus',  farge: '#a0703c' },
  { navn: 'Hvit mus',  farge: '#f5f5f5' },
  { navn: 'Svart mus', farge: '#444444' },
];

const SENTER = 350;
const YTRE_RADIUS = 300;
const INDRE_RADIUS = 95;
const OMGANGER = 2.5;
const SVG_NS = 'http://www.w3.org/2000/svg';
const HOPP_TID = 280;        // millisekunder for ett hopp fra felt til felt
const HOPP_HOYDE = 18;       // hvor høyt musen hopper
const TRILLE_TID = 700;      // millisekunder terningen ruller før den viser tallet
const SALTO_TID = 700;       // millisekunder for én backflip
const SALTO_PAUSE = 300;     // pause mellom hver backflip
const SALTO_HOYDE = 45;      // hvor høyt vinnermusen hopper når den tar backflip
const ANTALL_KONFETTI = 80;
const KONFETTI_FARGER = ['#e8a317', '#7cc576', '#e89aa6', '#ffd54a', '#6fa8dc', '#d9534f'];

// ---------- Tilstand ----------
// Posisjon 0 = START, ANTALL_STEG = osten i midten
let spillere = [];      // fylles fra startskjermen
let posisjoner = [];
let tur = 0;
let ferdig = false;
let antallValgt = 2;   // forhåndsvalgt på startskjermen
let opptatt = false;   // sant mens terningen ruller eller musen hopper
let museGrupper = [];  // SVG-gruppen til hver mus på brettet

const startskjerm = document.getElementById('startskjerm');
const antallValg = document.getElementById('antallValg');
const navneskjema = document.getElementById('navneskjema');
const navnefelt = document.getElementById('navnefelt');
const spillet = document.getElementById('spillet');
const brett = document.getElementById('brett');
const statusTekst = document.getElementById('status');
const terning = document.getElementById('terning');
const kastKnapp = document.getElementById('kast');
const spillerliste = document.getElementById('spillerliste');

// ---------- Hjelpefunksjoner ----------
function lag(type, attributter = {}, forelder = null) {
  const el = document.createElementNS(SVG_NS, type);
  for (const [navn, verdi] of Object.entries(attributter)) el.setAttribute(navn, verdi);
  if (forelder) forelder.appendChild(el);
  return el;
}

// Fordeler stegene med lik avstand langs en spiral fra ytterkanten inn mot midten
function lagSpiralPunkter(antall) {
  const thetaMaks = OMGANGER * 2 * Math.PI;
  const proever = [];
  let lengde = 0;
  for (let i = 0; i <= 4000; i++) {
    const t = (i / 4000) * thetaMaks;
    const r = YTRE_RADIUS - (YTRE_RADIUS - INDRE_RADIUS) * (t / thetaMaks);
    const p = { x: SENTER + r * Math.cos(t - Math.PI / 2), y: SENTER + r * Math.sin(t - Math.PI / 2) };
    if (proever.length) {
      const f = proever[proever.length - 1];
      lengde += Math.hypot(p.x - f.x, p.y - f.y);
    }
    p.lengde = lengde;
    proever.push(p);
  }

  const punkter = [];
  let j = 0;
  for (let k = 0; k < antall; k++) {
    const maal = (lengde * k) / (antall - 1);
    while (j < proever.length - 1 && proever[j].lengde < maal) j++;
    punkter.push({ x: proever[j].x, y: proever[j].y });
  }
  return punkter;
}

const steg = lagSpiralPunkter(ANTALL_STEG);
const plasser = [...steg, { x: SENTER, y: SENTER }]; // siste plass = osten

// ---------- Tegning ----------
function tegnBrett() {
  // Stien mellom stegene
  const d = plasser.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  lag('path', { d, fill: 'none', stroke: '#d9c9a3', 'stroke-width': 30, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, brett);

  // Stegene
  steg.forEach((p, i) => {
    const erStart = i === 0;
    lag('circle', {
      cx: p.x, cy: p.y, r: erStart ? 30 : 22,
      fill: erStart ? '#7cc576' : '#fffaf0',
      stroke: '#8a7650', 'stroke-width': 3,
    }, brett);
    if (erStart) {
      const tekst = lag('text', {
        x: p.x, y: p.y - 38, 'text-anchor': 'middle',
        'font-size': 18, 'font-weight': 'bold', fill: '#2f6b2a',
      }, brett);
      tekst.textContent = 'START';
    }
  });

  tegnOst(lag('g', { transform: `translate(${SENTER} ${SENTER}) scale(1.1)` }, brett));
  lag('g', { id: 'muselag' }, brett);
}

// Et ostestykke skåret ut som et kakestykke fra en stor rund ost
function tegnOst(g) {
  // Kakestykke sett litt ovenfra: spissen peker mot venstre (der midten av den runde osten var),
  // den buede skorpen er på høyre side.
  const kant = { stroke: '#b07a10', 'stroke-width': 2, 'stroke-linejoin': 'round' };
  // Skorpe (den buede utsiden av den runde osten)
  lag('path', { d: 'M 37.3 1.4 A 95 42.75 0 0 0 50 -20 L 50 10 A 95 42.75 0 0 1 37.3 31.4 Z', fill: '#e09a1a', ...kant }, g);
  // Forside (snittflaten)
  lag('path', { d: 'M -45 -20 L 37.3 1.4 L 37.3 31.4 L -45 10 Z', fill: '#f2b72c', ...kant }, g);
  // Overside
  lag('path', { d: 'M -45 -20 L 37.3 1.4 A 95 42.75 0 0 0 46.8 -31.1 Z', fill: '#ffd54a', ...kant }, g);
  // Hull
  lag('ellipse', { cx: -15, cy: 3, rx: 6, ry: 5, fill: '#d99a1c' }, g);
  lag('ellipse', { cx: 15, cy: 16, rx: 4.5, ry: 4, fill: '#d99a1c' }, g);
  lag('ellipse', { cx: 0, cy: -17, rx: 5, ry: 2.2, fill: '#e6b52e' }, g);
  lag('ellipse', { cx: 25, cy: -15, rx: 3.5, ry: 1.6, fill: '#e6b52e' }, g);
}

// En enkel mus med ører og hale
function tegnMus(g, farge) {
  lag('path', { d: 'M -14 6 Q -30 14 -28 -6', fill: 'none', stroke: '#e89aa6', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g); // hale
  lag('ellipse', { cx: 0, cy: 4, rx: 15, ry: 10, fill: farge, stroke: '#333', 'stroke-width': 1.5 }, g); // kropp
  lag('circle', { cx: 10, cy: -10, r: 5.5, fill: farge, stroke: '#333', 'stroke-width': 1.5 }, g); // øre
  lag('circle', { cx: 10, cy: -10, r: 2.8, fill: '#e89aa6' }, g);
  lag('circle', { cx: 18, cy: -11, r: 5.5, fill: farge, stroke: '#333', 'stroke-width': 1.5 }, g); // øre
  lag('circle', { cx: 18, cy: -11, r: 2.8, fill: '#e89aa6' }, g);
  lag('circle', { cx: 15, cy: -2, r: 8, fill: farge, stroke: '#333', 'stroke-width': 1.5 }, g); // hode
  lag('circle', { cx: 18, cy: -4, r: 1.6, fill: '#222' }, g); // øye
  lag('circle', { cx: 23, cy: -1, r: 1.8, fill: '#e89aa6' }, g); // nese
}

// Forskyvning når flere mus står på samme plass
const FORSKYVNING = [[0, 0], [-10, -12], [10, 12], [-10, 12], [10, -12]];

// Hvor mus nummer i skal stå (flyttes litt til siden hvis flere står på samme plass)
function musePlass(i) {
  const plass = plasser[posisjoner[i]];
  const samme = posisjoner.filter((p) => p === posisjoner[i]).length;
  const rekkefolge = posisjoner.slice(0, i).filter((p) => p === posisjoner[i]).length;
  const [dx, dy] = samme > 1 ? FORSKYVNING[rekkefolge + 1] : FORSKYVNING[0];
  return { x: plass.x + dx, y: plass.y + dy - 4 };
}

function tegnMusene() {
  const lagMus = document.getElementById('muselag');
  lagMus.innerHTML = '';
  museGrupper = spillere.map((spiller, i) => {
    const { x, y } = musePlass(i);
    const g = lag('g', { transform: `translate(${x} ${y})` }, lagMus);
    // Den indre gruppen beveger seg litt hele tiden (se .mus-kropp i style.css).
    // Hver mus starter bevegelsen på ulikt tidspunkt, så de ikke beveger seg i takt.
    const kropp = lag('g', { class: 'mus-kropp', style: `animation-delay: ${-i * 0.7}s` }, g);
    tegnMus(kropp, spiller.farge);
    return g;
  });
}

// Ett hopp i en bue fra ett punkt til et annet
function hopp(g, fra, til) {
  return new Promise((ferdigHopp) => {
    const start = performance.now();
    function ramme(naa) {
      const t = Math.min((naa - start) / HOPP_TID, 1);
      const x = fra.x + (til.x - fra.x) * t;
      const y = fra.y + (til.y - fra.y) * t - Math.sin(t * Math.PI) * HOPP_HOYDE;
      g.setAttribute('transform', `translate(${x} ${y})`);
      if (t < 1) requestAnimationFrame(ramme);
      else ferdigHopp();
    }
    requestAnimationFrame(ramme);
  });
}

// Musen hopper felt for felt fremover
async function flyttMus(i, antallHopp) {
  const g = museGrupper[i];
  g.parentNode.appendChild(g); // tegnes over de andre musene mens den hopper
  g.classList.add('hopper');
  let fra = musePlass(i);
  for (let s = 0; s < antallHopp; s++) {
    posisjoner[i]++;
    const plass = plasser[posisjoner[i]];
    const til = { x: plass.x, y: plass.y - 4 };
    await hopp(g, fra, til);
    fra = til;
  }
  tegnMusene(); // plasserer musene pent igjen hvis flere står på samme felt
}

// ---------- Seiersfeiring ----------
// Vinnermusen tar backflip etter backflip ved osten, og konfetti faller over brettet
function feirSeier(i) {
  // Har man slått av animasjoner i operativsystemet, vises bare seiersteksten
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const g = museGrupper[i];
  g.parentNode.appendChild(g); // vinneren tegnes over de andre musene
  g.classList.add('feirer');
  const { x, y } = musePlass(i);
  const start = performance.now();

  function ramme(naa) {
    const tid = (naa - start) % (SALTO_TID + SALTO_PAUSE);
    const t = Math.min(tid / SALTO_TID, 1);
    const hoyde = Math.sin(t * Math.PI) * SALTO_HOYDE;
    // Musen ser mot høyre, så en backflip er å rulle bakover (mot klokka)
    const vinkel = -360 * (1 - Math.cos(t * Math.PI)) / 2;
    g.setAttribute('transform', `translate(${x} ${y - hoyde}) rotate(${vinkel})`);
    requestAnimationFrame(ramme);
  }
  requestAnimationFrame(ramme);

  slippKonfetti();
}

function slippKonfetti() {
  const konfettilag = lag('g', { 'aria-hidden': 'true' }, brett);
  const biter = [];
  for (let k = 0; k < ANTALL_KONFETTI; k++) {
    biter.push({
      el: lag('rect', {
        x: -5, y: -2.5, width: 10, height: 5, rx: 1,
        fill: KONFETTI_FARGER[k % KONFETTI_FARGER.length],
      }, konfettilag),
      x: Math.random() * 700,
      y: -40 - Math.random() * 600,           // starter over brettet, til litt ulik tid
      fart: 120 + Math.random() * 120,         // piksler per sekund
      vinkel: Math.random() * 360,
      spinn: (Math.random() - 0.5) * 720,      // grader per sekund
      svai: Math.random() * Math.PI * 2,       // vugger fra side til side
    });
  }

  let forrige = performance.now();
  function ramme(naa) {
    const dt = (naa - forrige) / 1000;
    forrige = naa;
    let igjen = 0;
    for (const b of biter) {
      b.y += b.fart * dt;
      b.vinkel += b.spinn * dt;
      b.svai += dt * 3;
      const bx = b.x + Math.sin(b.svai) * 15;
      b.el.setAttribute('transform', `translate(${bx} ${b.y}) rotate(${b.vinkel})`);
      if (b.y < 720) igjen++;
    }
    if (igjen) requestAnimationFrame(ramme);
    else konfettilag.remove(); // all konfettien har falt ut av brettet
  }
  requestAnimationFrame(ramme);
}

// Prikkplassering i et 3 x 3 rutenett (0–8) for hvert terningkast
const PRIKKER = {
  1: [4], 2: [0, 8], 3: [0, 4, 8],
  4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
};

function visTerning(verdi) {
  terning.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const celle = document.createElement('div');
    if (verdi && PRIKKER[verdi].includes(i)) celle.className = 'prikk';
    terning.appendChild(celle);
  }
  terning.setAttribute('aria-label', verdi ? `Terningen viser ${verdi}` : 'Terningen');
}

// Terningen ruller og viser tilfeldige tall en liten stund
function trillTerning() {
  return new Promise((ferdigTrilla) => {
    terning.classList.add('triller');
    const bytt = setInterval(() => visTerning(1 + Math.floor(Math.random() * 6)), 80);
    setTimeout(() => {
      clearInterval(bytt);
      terning.classList.remove('triller');
      ferdigTrilla();
    }, TRILLE_TID);
  });
}

// En liten mus-tegning til startskjermen og spillerlisten
function lagMuseikon(farge) {
  const ikon = document.createElementNS(SVG_NS, 'svg');
  ikon.setAttribute('viewBox', '-32 -20 60 36');
  ikon.setAttribute('class', 'museikon');
  ikon.setAttribute('aria-hidden', 'true');
  tegnMus(ikon, farge);
  return ikon;
}

// Viser hvem som er med, og hvem sin tur det er
function visSpillerliste() {
  spillerliste.innerHTML = '';
  spillere.forEach((spiller, i) => {
    const rad = document.createElement('li');
    const navn = document.createElement('span');
    navn.textContent = spiller.navn;
    rad.append(lagMuseikon(spiller.farge), navn);
    if (i === tur) {
      rad.classList.add('aktiv');
      rad.setAttribute('aria-current', 'true');
    }
    spillerliste.appendChild(rad);
  });
}

function oppdaterStatus() {
  statusTekst.textContent = `${spillere[tur].navn} sin tur`;
  visSpillerliste();
}

// ---------- Spillogikk ----------
async function kastTerning() {
  if (ferdig || opptatt) return;
  opptatt = true;
  kastKnapp.disabled = true;

  const kast = 1 + Math.floor(Math.random() * 6);
  await trillTerning();
  visTerning(kast);

  const antallHopp = Math.min(kast, ANTALL_STEG - posisjoner[tur]);
  await flyttMus(tur, antallHopp);
  opptatt = false;

  if (posisjoner[tur] === ANTALL_STEG) {
    ferdig = true;
    statusTekst.textContent = `${spillere[tur].navn} kom først til osten og vant!`;
    feirSeier(tur);
    return;
  }

  tur = (tur + 1) % spillere.length;
  oppdaterStatus();
  kastKnapp.disabled = false;
}

// ---------- Startskjerm ----------
// Lager ett navnefelt per spiller, med musen spilleren får ved siden av
function visNavnefelt() {
  const skrevet = [...navnefelt.querySelectorAll('input')].map((f) => f.value);
  navnefelt.innerHTML = '';

  for (let i = 0; i < antallValgt; i++) {
    const rad = document.createElement('label');
    rad.className = 'navnerad';

    const ikon = lagMuseikon(MUSER[i].farge);

    const felt = document.createElement('input');
    felt.type = 'text';
    felt.maxLength = 20;
    felt.placeholder = MUSER[i].navn;
    felt.value = skrevet[i] || '';
    felt.setAttribute('aria-label', `Navn på spiller ${i + 1}`);

    rad.append(ikon, felt);
    navnefelt.appendChild(rad);
  }

  antallValg.querySelectorAll('button').forEach((knapp) => {
    knapp.classList.toggle('valgt', Number(knapp.dataset.antall) === antallValgt);
  });
}

function startSpillet(hendelse) {
  hendelse.preventDefault();
  const felt = [...navnefelt.querySelectorAll('input')];
  spillere = felt.map((f, i) => ({
    navn: f.value.trim() || MUSER[i].navn,
    farge: MUSER[i].farge,
  }));
  posisjoner = spillere.map(() => 0);
  tur = 0;
  ferdig = false;
  opptatt = false;
  kastKnapp.disabled = false;

  startskjerm.hidden = true;
  spillet.hidden = false;
  tegnMusene();
  visTerning(null);
  oppdaterStatus();
}

antallValg.addEventListener('click', (hendelse) => {
  const knapp = hendelse.target.closest('button');
  if (!knapp) return;
  antallValgt = Number(knapp.dataset.antall);
  visNavnefelt();
});

// ---------- Start ----------
tegnBrett();
visNavnefelt();
navneskjema.addEventListener('submit', startSpillet);
kastKnapp.addEventListener('click', kastTerning);
