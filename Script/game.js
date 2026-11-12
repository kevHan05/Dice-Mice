// Dice-Mice!

// ---------- Innstillinger ----------
// Brettene man kan velge mellom på startskjermen
const BRETT = {
  kort:   { antallSteg: 30, omganger: 2 },
  vanlig: { antallSteg: 40, omganger: 2.5 },
  lang:   { antallSteg: 55, omganger: 3 },
};

// Spiller 1 får første farge, spiller 2 den andre osv. Navnet brukes hvis spilleren ikke skriver inn noe.
const MUSER = [
  { navn: 'Grå mus',   farge: '#9a9a9a' },
  { navn: 'Brun mus',  farge: '#a0703c' },
  { navn: 'Hvit mus',  farge: '#f5f5f5' },
  { navn: 'Svart mus', farge: '#444444' },
];

// Pynt musene kan ha på seg (velges på startskjermen)
const PYNT = [
  { id: 'ingen',   navn: 'Ingen pynt' },
  { id: 'hatt',    navn: 'Partyhatt' },
  { id: 'krone',   navn: 'Krone' },
  { id: 'sloyfe',  navn: 'Sløyfe' },
  { id: 'briller', navn: 'Briller' },
];

// Spesialfelt: gjør noe når en mus lander på dem
const SPESIALFELT = {
  frem:    { ikon: '⏩', farge: '#bfe3b4', tekst: (n) => `${n} fant ostesmuler og hopper 3 felt frem!` },
  tilbake: { ikon: '⏪', farge: '#f4b6b6', tekst: (n) => `${n} gikk i en musefelle og må 3 felt tilbake!` },
  igjen:   { ikon: '🎲', farge: '#ffe08a', tekst: (n) => `${n} får kaste igjen!` },
  // Kattefeltet har ikke ikon på feltet: en sovende katt ligger ved siden av (se tegnKatt)
  over:    { ikon: '😾', farge: '#c9d7f0', tekst: (n) => `${n} vekket katten! Den ble sur, og ${n} står over neste runde.` },
};
const SPESIAL_STEG = 3;            // hvor langt frem/tilbake spesialfeltene flytter musen
const ANDEL_SPESIALFELT = 1 / 6;   // omtrent hvert sjette felt er et spesialfelt

const REAKSJONER = ['👍', '😂', '😮', '😢', '🧀', '🎉'];

const SENTER = 350;
const YTRE_RADIUS = 300;
const INDRE_RADIUS = 95;
const SVG_NS = 'http://www.w3.org/2000/svg';
const HOPP_TID = 280;        // millisekunder for ett hopp fra felt til felt
const HOPP_HOYDE = 18;       // hvor høyt musen hopper
const LYS_TID = 500;         // millisekunder feltet musen skal til lyser før den hopper
const TRILLE_TID = 700;      // millisekunder terningen ruller før den viser tallet
const SUR_TID = 3000;        // millisekunder katten er sur før den sovner igjen
const SALTO_TID = 700;      // millisekunder for én backflip
const SALTO_PAUSE = 300;     // pause mellom hver backflip
const SALTO_HOYDE = 45;      // hvor høyt vinnermusen hopper når den tar backflip
const ANTALL_KONFETTI = 80;
const KONFETTI_FARGER = ['#e8a317', '#7cc576', '#e89aa6', '#ffd54a', '#6fa8dc', '#d9534f'];

// ---------- Tilstand ----------
// Posisjon 0 = START, antallSteg = osten i midten
let spillere = [];      // fylles fra startskjermen: { navn, farge, pynt }
let posisjoner = [];
let staOver = [];       // sant for en spiller som må stå over neste runde
let tur = 0;
let ferdig = false;
let opptatt = false;    // sant mens terningen ruller eller musen hopper
let antallValgt = 2;    // forhåndsvalgt på startskjermen
let brettValgt = 'vanlig';

let antallSteg = 40;
let steg = [];          // punktene på spiralen
let plasser = [];       // stegene + osten
let spesial = {};       // feltnummer -> type spesialfelt
let museGrupper = [];   // SVG-gruppen til hver mus på brettet
let feltSirkler = [];   // sirkelen til hvert felt, så feltet kan lyse opp
let katter = {};        // feltnummer -> katten som ligger ved siden av kattefeltet
let feiringNr = 0;      // økes for å stoppe pågående feiring (backflips og konfetti)

let lydPaa = true;
let musikkPaa = false;

const startskjerm = document.getElementById('startskjerm');
const antallValg = document.getElementById('antallValg');
const brettValg = document.getElementById('brettValg');
const navneskjema = document.getElementById('navneskjema');
const navnefelt = document.getElementById('navnefelt');
const spillet = document.getElementById('spillet');
const brettramme = document.getElementById('brettramme');
const brett = document.getElementById('brett');
const statusTekst = document.getElementById('status');
const hendelseTekst = document.getElementById('hendelse');
const terning = document.getElementById('terning');
const kastKnapp = document.getElementById('kast');
const pallKnapp = document.getElementById('tilPallen');
const spillerliste = document.getElementById('spillerliste');
const reaksjoner = document.getElementById('reaksjoner');
const resultat = document.getElementById('resultat');
const pall = document.getElementById('pall');
const spillIgjenKnapp = document.getElementById('spillIgjen');
const lobbyKnapp = document.getElementById('tilLobby');
const lydKnapp = document.getElementById('lydKnapp');
const musikkKnapp = document.getElementById('musikkKnapp');
const volumValg = document.getElementById('volumValg');
const volumSlider = document.getElementById('volum');

// ---------- Hjelpefunksjoner ----------
function lag(type, attributter = {}, forelder = null) {
  const el = document.createElementNS(SVG_NS, type);
  for (const [navn, verdi] of Object.entries(attributter)) el.setAttribute(navn, verdi);
  if (forelder) forelder.appendChild(el);
  return el;
}

function vent(ms) {
  return new Promise((ferdigVentet) => setTimeout(ferdigVentet, ms));
}

// Sant hvis man har slått av animasjoner i operativsystemet
function reduserBevegelse() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Fordeler stegene med lik avstand langs en spiral fra ytterkanten inn mot midten
function lagSpiralPunkter(antall, omganger) {
  const thetaMaks = omganger * 2 * Math.PI;
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

// Legger spesialfeltene på tilfeldige plasser (nye plasser hver runde)
function plasserSpesialfelt() {
  spesial = {};
  const kandidater = [];
  for (let i = 2; i < antallSteg - 1; i++) kandidater.push(i); // ikke på START, første felt eller rett før osten
  // Stokker kandidatene (Fisher–Yates)
  for (let i = kandidater.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kandidater[i], kandidater[j]] = [kandidater[j], kandidater[i]];
  }
  const typer = Object.keys(SPESIALFELT);
  const antall = Math.round(antallSteg * ANDEL_SPESIALFELT);
  kandidater.slice(0, antall).forEach((felt, k) => {
    spesial[felt] = typer[k % typer.length];
  });
}

// ---------- Lyd ----------
// Lydeffektene lages direkte i nettleseren (Web Audio), så de trenger ingen lydfiler
let lydKontekst = null;

function hentLydKontekst() {
  if (!lydKontekst) {
    const Kontekst = window.AudioContext || window.webkitAudioContext;
    if (!Kontekst) return null;
    lydKontekst = new Kontekst();
  }
  if (lydKontekst.state === 'suspended') lydKontekst.resume();
  return lydKontekst;
}

function tone(frekvens, start, varighet, { type = 'sine', volum = 0.2, tilFrekvens = null } = {}) {
  if (!lydPaa) return;
  const ktx = hentLydKontekst();
  if (!ktx) return;
  const t0 = ktx.currentTime + start;
  const oscillator = ktx.createOscillator();
  const forsterker = ktx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frekvens, t0);
  if (tilFrekvens) oscillator.frequency.exponentialRampToValueAtTime(tilFrekvens, t0 + varighet);
  forsterker.gain.setValueAtTime(volum, t0);
  forsterker.gain.exponentialRampToValueAtTime(0.001, t0 + varighet);
  oscillator.connect(forsterker).connect(ktx.destination);
  oscillator.start(t0);
  oscillator.stop(t0 + varighet);
}

// Hvit støy som gjenbrukes til terningklakkene
let stoyBuffer = null;

function hentStoy(ktx) {
  if (!stoyBuffer) {
    const lengde = Math.floor(ktx.sampleRate * 0.1);
    stoyBuffer = ktx.createBuffer(1, lengde, ktx.sampleRate);
    const data = stoyBuffer.getChannelData(0);
    for (let i = 0; i < lengde; i++) data[i] = Math.random() * 2 - 1;
  }
  return stoyBuffer;
}

// Ett kort «klakk» – terningen som treffer bordet
function klakk(start, { frekvens = 2500, volum = 0.3, varighet = 0.035 } = {}) {
  if (!lydPaa) return;
  const ktx = hentLydKontekst();
  if (!ktx) return;
  const t0 = ktx.currentTime + start;
  const kilde = ktx.createBufferSource();
  kilde.buffer = hentStoy(ktx);
  const filter = ktx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = frekvens;
  filter.Q.value = 2;
  const forsterker = ktx.createGain();
  forsterker.gain.setValueAtTime(volum, t0);
  forsterker.gain.exponentialRampToValueAtTime(0.001, t0 + varighet);
  kilde.connect(filter).connect(forsterker).connect(ktx.destination);
  kilde.start(t0);
  kilde.stop(t0 + varighet);
}

// En terning som ruller: raske klakk som blir glissere, og et dunk når den stopper
function terningRuller(varighet) {
  let t = 0;
  let mellomrom = 0.035;
  while (t < varighet - 0.08) {
    klakk(t, { frekvens: 1800 + Math.random() * 2200, volum: 0.15 + Math.random() * 0.15 });
    t += mellomrom * (0.7 + Math.random() * 0.6);
    mellomrom *= 1.12;
  }
  klakk(varighet, { frekvens: 1400, volum: 0.4, varighet: 0.06 });
  tone(130, varighet, 0.09, { tilFrekvens: 70, volum: 0.25 });
}

// En sur katt som hveser (susende støy) og knurrer litt
function hvese() {
  if (!lydPaa) return;
  const ktx = hentLydKontekst();
  if (!ktx) return;
  const t0 = ktx.currentTime;
  const lengde = Math.floor(ktx.sampleRate * 0.6);
  const buffer = ktx.createBuffer(1, lengde, ktx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < lengde; i++) data[i] = Math.random() * 2 - 1;
  const kilde = ktx.createBufferSource();
  kilde.buffer = buffer;
  const filter = ktx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 2500;
  const forsterker = ktx.createGain();
  forsterker.gain.setValueAtTime(0.001, t0);
  forsterker.gain.linearRampToValueAtTime(0.25, t0 + 0.05);
  forsterker.gain.exponentialRampToValueAtTime(0.001, t0 + 0.6);
  kilde.connect(filter).connect(forsterker).connect(ktx.destination);
  kilde.start(t0);
  kilde.stop(t0 + 0.6);
  tone(220, 0, 0.35, { type: 'sawtooth', tilFrekvens: 160, volum: 0.05 });
}

const lyd = {
  terning: () => terningRuller(TRILLE_TID / 1000),
  hopp: () => tone(320, 0, 0.12, { tilFrekvens: 640, volum: 0.12 }),
  frem: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.15)),
  tilbake: () => [784, 659, 523].forEach((f, i) => tone(f, i * 0.08, 0.15)),
  igjen: () => { tone(660, 0, 0.1); tone(880, 0.12, 0.15); },
  over: () => hvese(),
  reaksjon: () => tone(880, 0, 0.08, { volum: 0.1 }),
  seier: () => [523, 659, 784, 1047].forEach((f, i) =>
    tone(f, i * 0.15, i === 3 ? 0.6 : 0.18, { type: 'triangle', volum: 0.25 })),
};

// Musikk: sangen ligger i assets/audio/tema.mp3 (stien er regnet fra Script-mappen).
// Musikk-knappen og volumet vises bare når filen finnes.
const musikk = new Audio();
musikk.loop = true;
musikk.volume = Number(volumSlider.value);
musikk.preload = 'auto';
musikk.addEventListener('canplay', () => {
  musikkKnapp.hidden = false;
  volumValg.hidden = false;
}, { once: true });
musikk.src = '../assets/audio/tema.mp3';
let musikkValgt = false; // sant når spilleren selv har trykket på musikk-knappen

function spillMusikk() {
  musikkPaa = true;
  musikk.play().catch(() => {});
  oppdaterLydKnapper();
}

function oppdaterLydKnapper() {
  lydKnapp.textContent = lydPaa ? '🔊 Lyd på' : '🔇 Lyd av';
  lydKnapp.setAttribute('aria-pressed', String(lydPaa));
  musikkKnapp.textContent = musikkPaa ? '🎵 Musikk på' : '🎵 Musikk av';
  musikkKnapp.setAttribute('aria-pressed', String(musikkPaa));
}

// ---------- Tegning ----------
function tegnBrett() {
  brett.innerHTML = '';
  katter = {};

  // Den runde brettplaten
  lag('circle', {
    cx: SENTER, cy: SENTER, r: YTRE_RADIUS + 45,
    fill: '#fbf6ea', stroke: '#d9c9a3', 'stroke-width': 4,
  }, brett);

  // Stien mellom stegene
  const d = plasser.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  lag('path', { d, fill: 'none', stroke: '#d9c9a3', 'stroke-width': 30, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, brett);

  // Stegene
  feltSirkler = steg.map((p, i) => {
    const erStart = i === 0;
    const type = spesial[i];
    const sirkel = lag('circle', {
      cx: p.x, cy: p.y, r: erStart ? 30 : 22,
      fill: erStart ? '#7cc576' : type ? SPESIALFELT[type].farge : '#fffaf0',
      stroke: '#8a7650', 'stroke-width': 3,
    }, brett);
    if (type === 'over') {
      // Katten ligger på utsiden av feltet (bort fra midten av brettet), langs stien,
      // med ryggen ut mot kanten så den ikke kommer borti ringen ved siden av
      const avstand = Math.hypot(p.x - SENTER, p.y - SENTER);
      const nx = (p.x - SENTER) / avstand;
      const ny = (p.y - SENTER) / avstand;
      const vinkel = (Math.atan2(nx, -ny) * 180) / Math.PI;
      const katt = lag('g', {
        class: 'katt',
        transform: `translate(${p.x + nx * 36} ${p.y + ny * 36}) rotate(${vinkel}) scale(1.25)`,
      }, brett);
      tegnKatt(lag('g', { class: 'katt-kropp' }, katt));
      katter[i] = katt;
    } else if (type) {
      const ikon = lag('text', {
        x: p.x, y: p.y + 1, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': 18,
      }, brett);
      ikon.textContent = SPESIALFELT[type].ikon;
    }
    if (erStart) {
      // Teksten står til venstre for START-feltet, inne på brettplaten
      const tekst = lag('text', {
        x: p.x - 38, y: p.y + 6, 'text-anchor': 'end',
        'font-size': 18, 'font-weight': 'bold', fill: '#2f6b2a',
      }, brett);
      tekst.textContent = 'START';
    }
    return sirkel;
  });

  tegnOst(lag('g', { transform: `translate(${SENTER} ${SENTER}) scale(1.1)` }, brett));
  lag('g', { id: 'muselag' }, brett);
}

// En katt som ligger krøllet sammen. Den har både sovende og sure øyne;
// CSS viser de sovende, og de sure når katten får klassen «sur».
function tegnKatt(g) {
  const pels = '#e8a35a';
  const kant = { stroke: '#333', 'stroke-width': 1.3, 'stroke-linejoin': 'round' };
  const hale = 'M 10 6 Q 20 8 16 -2';
  lag('path', { d: hale, fill: 'none', stroke: '#333', 'stroke-width': 5.5, 'stroke-linecap': 'round' }, g);
  lag('path', { d: hale, fill: 'none', stroke: pels, 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  lag('ellipse', { cx: 2, cy: 4, rx: 12, ry: 7, fill: pels, ...kant }, g); // kropp
  lag('path', { d: 'M -14 -3 L -13 -12 L -8 -6 Z', fill: pels, ...kant }, g); // øre
  lag('path', { d: 'M -6 -6 L -3 -13 L -1 -4 Z', fill: pels, ...kant }, g); // øre
  lag('circle', { cx: -8, cy: 0, r: 7, fill: pels, ...kant }, g); // hode

  // Sover: lukkede øyne og en «z» som flyter opp
  const sover = lag('g', { class: 'katt-sover' }, g);
  lag('path', {
    d: 'M -12.5 0 q 1.5 1.5 3 0 M -6.5 0 q 1.5 1.5 3 0',
    fill: 'none', stroke: '#333', 'stroke-width': 1.1, 'stroke-linecap': 'round',
  }, sover);
  const z = lag('text', { x: -2, y: -12, 'font-size': 9, 'font-weight': 'bold', fill: '#6f8fc0', class: 'katt-zzz' }, sover);
  z.textContent = 'z';

  // Sur: gule øyne, sinte øyenbryn og sur munn
  const sur = lag('g', { class: 'katt-sur' }, g);
  lag('circle', { cx: -11, cy: 0, r: 1.8, fill: '#ffd54a', stroke: '#333', 'stroke-width': 0.8 }, sur);
  lag('circle', { cx: -5, cy: 0, r: 1.8, fill: '#ffd54a', stroke: '#333', 'stroke-width': 0.8 }, sur);
  lag('path', {
    d: 'M -13.5 -3.8 L -9.5 -2.2 M -2.5 -3.8 L -6.5 -2.2',
    stroke: '#333', 'stroke-width': 1.3, 'stroke-linecap': 'round',
  }, sur);
  lag('path', { d: 'M -10 4.5 L -8 3.3 L -6 4.5', fill: 'none', stroke: '#333', 'stroke-width': 1 }, sur);
  const sint = lag('text', { x: 3, y: -8, 'font-size': 10 }, sur);
  sint.textContent = '💢';
}

// Katten på feltet våkner og blir sur en liten stund, så sovner den igjen
function vekkKatt(felt) {
  const katt = katter[felt];
  if (!katt) return;
  katt.classList.add('sur');
  clearTimeout(katt.sovnTimer);
  katt.sovnTimer = setTimeout(() => katt.classList.remove('sur'), SUR_TID);
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

// En enkel mus med ører og hale (og eventuelt pynt)
function tegnMus(g, farge, pynt = 'ingen') {
  lag('path', { d: 'M -14 6 Q -30 14 -28 -6', fill: 'none', stroke: '#e89aa6', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g); // hale
  lag('ellipse', { cx: 0, cy: 4, rx: 15, ry: 10, fill: farge, stroke: '#333', 'stroke-width': 1.5 }, g); // kropp
  lag('circle', { cx: 10, cy: -10, r: 5.5, fill: farge, stroke: '#333', 'stroke-width': 1.5 }, g); // øre
  lag('circle', { cx: 10, cy: -10, r: 2.8, fill: '#e89aa6' }, g);
  lag('circle', { cx: 18, cy: -11, r: 5.5, fill: farge, stroke: '#333', 'stroke-width': 1.5 }, g); // øre
  lag('circle', { cx: 18, cy: -11, r: 2.8, fill: '#e89aa6' }, g);
  lag('circle', { cx: 15, cy: -2, r: 8, fill: farge, stroke: '#333', 'stroke-width': 1.5 }, g); // hode
  lag('circle', { cx: 18, cy: -4, r: 1.6, fill: '#222' }, g); // øye
  lag('circle', { cx: 23, cy: -1, r: 1.8, fill: '#e89aa6' }, g); // nese
  tegnPynt(g, pynt);
}

function tegnPynt(g, pynt) {
  const kant = { stroke: '#333', 'stroke-width': 1.2, 'stroke-linejoin': 'round' };
  if (pynt === 'hatt') {
    lag('path', { d: 'M 9 -7 L 18 -27 L 22 -6 Z', fill: '#6fa8dc', ...kant }, g);
    lag('circle', { cx: 18, cy: -27, r: 2.5, fill: '#e8a317' }, g);
  } else if (pynt === 'krone') {
    lag('path', { d: 'M 10 -8 L 9 -18 L 13 -14 L 16 -20 L 19 -14 L 22 -17 L 21 -7 Z', fill: '#ffd54a', ...kant, stroke: '#b07a10' }, g);
  } else if (pynt === 'sloyfe') {
    lag('path', { d: 'M 8 4 L 2 -1 L 2 9 Z M 8 4 L 14 -1 L 14 9 Z', fill: '#d9534f', ...kant }, g);
    lag('circle', { cx: 8, cy: 4, r: 2, fill: '#b8322e' }, g);
  } else if (pynt === 'briller') {
    lag('circle', { cx: 18.5, cy: -4, r: 3.6, fill: 'rgba(255,255,255,0.35)', stroke: '#222', 'stroke-width': 1.2 }, g);
    lag('path', { d: 'M 15 -4.5 L 10 -6', stroke: '#222', 'stroke-width': 1.2, 'stroke-linecap': 'round' }, g);
  }
}

// Tårer som triller ned fra øyet (til musen som ikke kom på pallen)
function lagTaarer(g) {
  [0, 0.45].forEach((forsinkelse) => {
    const taare = lag('ellipse', { cx: 19, cy: -1, rx: 1.4, ry: 2.2, fill: '#6fa8dc', opacity: 0 }, g);
    lag('animate', { attributeName: 'cy', values: '-1;12', dur: '0.9s', begin: `${forsinkelse}s`, repeatCount: 'indefinite' }, taare);
    lag('animate', { attributeName: 'opacity', values: '1;0', dur: '0.9s', begin: `${forsinkelse}s`, repeatCount: 'indefinite' }, taare);
  });
}

// En liten mus-tegning til startskjermen og spillerlisten
function lagMuseikon(farge, pynt) {
  const ikon = document.createElementNS(SVG_NS, 'svg');
  ikon.setAttribute('viewBox', '-32 -30 60 46');
  ikon.setAttribute('class', 'museikon');
  ikon.setAttribute('aria-hidden', 'true');
  tegnMus(ikon, farge, pynt);
  return ikon;
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
    tegnMus(kropp, spiller.farge, spiller.pynt);
    return g;
  });
}

// ---------- Bevegelse ----------
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

// Musen hopper felt for felt, fremover (retning 1) eller bakover (retning -1).
// Feltet den skal til, lyser opp før den hopper.
async function flyttMus(i, antallHopp, retning = 1) {
  if (antallHopp <= 0) return;
  const maalfelt = feltSirkler[posisjoner[i] + antallHopp * retning]; // finnes ikke for osten
  if (maalfelt) maalfelt.classList.add('maalfelt');
  await vent(LYS_TID);

  const g = museGrupper[i];
  g.parentNode.appendChild(g); // tegnes over de andre musene mens den hopper
  g.classList.add('hopper');
  let fra = musePlass(i);
  for (let s = 0; s < antallHopp; s++) {
    posisjoner[i] += retning;
    const plass = plasser[posisjoner[i]];
    const til = { x: plass.x, y: plass.y - 4 };
    lyd.hopp();
    await hopp(g, fra, til);
    fra = til;
  }
  if (maalfelt) maalfelt.classList.remove('maalfelt');
  tegnMusene(); // plasserer musene pent igjen hvis flere står på samme felt
}

// ---------- Seiersfeiring ----------
// En mus tar backflip etter backflip til feiringen stoppes
function startSalto(g, x, y, skala, nr) {
  if (reduserBevegelse()) return;
  g.classList.add('feirer');
  const start = performance.now();
  function ramme(naa) {
    if (nr !== feiringNr) return; // feiringen er stoppet
    const tid = (naa - start) % (SALTO_TID + SALTO_PAUSE);
    const t = Math.min(tid / SALTO_TID, 1);
    const hoyde = Math.sin(t * Math.PI) * SALTO_HOYDE;
    // Musen ser mot høyre, så en backflip er å rulle bakover (mot klokka)
    const vinkel = -360 * (1 - Math.cos(t * Math.PI)) / 2;
    g.setAttribute('transform', `translate(${x} ${y - hoyde}) rotate(${vinkel}) scale(${skala})`);
    requestAnimationFrame(ramme);
  }
  requestAnimationFrame(ramme);
}

// Vinnermusen tar backflips ved osten, og konfetti faller over brettet
function feirSeier(i) {
  lyd.seier();
  if (reduserBevegelse()) return; // da vises bare seiersteksten
  const g = museGrupper[i];
  g.parentNode.appendChild(g); // vinneren tegnes over de andre musene
  const { x, y } = musePlass(i);
  startSalto(g, x, y, 1, feiringNr);
  slippKonfetti(feiringNr);
}

function slippKonfetti(nr) {
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
    if (nr !== feiringNr) { konfettilag.remove(); return; }
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

// ---------- Terning og spillerliste ----------
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
    lyd.terning();
    const bytt = setInterval(() => {
      visTerning(1 + Math.floor(Math.random() * 6));
    }, 80);
    setTimeout(() => {
      clearInterval(bytt);
      terning.classList.remove('triller');
      ferdigTrilla();
    }, TRILLE_TID);
  });
}

// Viser hvem som er med, og hvem sin tur det er
function visSpillerliste() {
  spillerliste.innerHTML = '';
  spillere.forEach((spiller, i) => {
    const rad = document.createElement('li');
    const navn = document.createElement('span');
    navn.textContent = spiller.navn;
    rad.append(lagMuseikon(spiller.farge, spiller.pynt), navn);
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
// Går videre til neste spiller. Spillere som må stå over, hoppes over.
// Gir tilbake navnene på dem som sto over.
function nesteTur() {
  const stoOver = [];
  for (;;) {
    tur = (tur + 1) % spillere.length;
    if (!staOver[tur]) return stoOver;
    staOver[tur] = false;
    stoOver.push(spillere[tur].navn);
  }
}

// Legger en ny linje til teksten om hva som skjedde
function leggTilHendelse(tekst) {
  hendelseTekst.textContent = [hendelseTekst.textContent, tekst].join(' ').trim();
}

async function kastTerning() {
  if (ferdig || opptatt) return;
  opptatt = true;
  kastKnapp.disabled = true;
  hendelseTekst.textContent = '';

  const kast = 1 + Math.floor(Math.random() * 6);
  await trillTerning();
  visTerning(kast);
  await flyttMus(tur, Math.min(kast, antallSteg - posisjoner[tur]));

  // Spesialfelt (det nye feltet musen havner på etterpå, gjør ingenting)
  const navn = spillere[tur].navn;
  const type = spesial[posisjoner[tur]];
  let kastIgjen = false;
  if (type) {
    hendelseTekst.textContent = `${SPESIALFELT[type].ikon} ${SPESIALFELT[type].tekst(navn)}`;
    lyd[type]();
    if (type === 'frem') {
      await flyttMus(tur, Math.min(SPESIAL_STEG, antallSteg - posisjoner[tur]));
    } else if (type === 'tilbake') {
      await flyttMus(tur, Math.min(SPESIAL_STEG, posisjoner[tur]), -1);
    } else if (type === 'igjen') {
      kastIgjen = true;
    } else if (type === 'over') {
      vekkKatt(posisjoner[tur]);
      staOver[tur] = true;
    }
  }

  // Slår man 6, får man kaste igjen (hver gang)
  if (kast === 6 && !kastIgjen && posisjoner[tur] < antallSteg) {
    kastIgjen = true;
    leggTilHendelse(`🎲 ${navn} slo 6 og kaster igjen!`);
    lyd.igjen();
  }
  opptatt = false;

  if (posisjoner[tur] === antallSteg) {
    ferdig = true;
    statusTekst.textContent = `${navn} kom først til osten og vant!`;
    visSpillerliste();
    kastKnapp.hidden = true;
    pallKnapp.hidden = false;
    feirSeier(tur);
    return;
  }

  if (!kastIgjen) {
    nesteTur().forEach((n) => leggTilHendelse(`😾 ${n} står over denne runden.`));
  }
  oppdaterStatus();
  kastKnapp.disabled = false;
}

// En emoji flyter opp over brettet
function sendReaksjon(emoji) {
  const el = document.createElement('span');
  el.className = 'reaksjon';
  el.textContent = emoji;
  el.setAttribute('aria-hidden', 'true');
  el.style.left = `${15 + Math.random() * 70}%`;
  brettramme.appendChild(el);
  lyd.reaksjon();
  setTimeout(() => el.remove(), 2000);
}

// ---------- Etter spillet: pallen ----------
// Plass 1 i midten, 2 til venstre, 3 til høyre. Nummer 4 står ved siden av og gråter.
const PALLPLASSER = [
  { x: 150, hoyde: 130, farge: '#ffd54a' },
  { x: 40,  hoyde: 90,  farge: '#d9d9d9' },
  { x: 260, hoyde: 60,  farge: '#e0a872' },
];
const PALL_BUNN = 240;

function kortNavn(navn) {
  return navn.length > 12 ? `${navn.slice(0, 11)}…` : navn;
}

function visPallen() {
  feiringNr++; // stopper backflips og konfetti på brettet
  const nr = feiringNr;
  spillet.hidden = true;
  resultat.hidden = false;
  pall.innerHTML = '';

  // Vinneren først, så resten etter hvor langt de kom (lik plass: den som kastet først)
  const vinner = tur;
  const rekkefolge = spillere.map((_, i) => i).sort((a, b) =>
    (b === vinner) - (a === vinner) || posisjoner[b] - posisjoner[a] || a - b);

  lag('line', {
    x1: 10, y1: PALL_BUNN, x2: 450, y2: PALL_BUNN,
    stroke: '#8a7650', 'stroke-width': 3, 'stroke-linecap': 'round',
  }, pall);

  rekkefolge.forEach((i, rang) => {
    const spiller = spillere[i];
    let x;
    let y;
    if (rang < 3) {
      const p = PALLPLASSER[rang];
      lag('rect', {
        x: p.x, y: PALL_BUNN - p.hoyde, width: 100, height: p.hoyde, rx: 6,
        fill: p.farge, stroke: '#8a7650', 'stroke-width': 3,
      }, pall);
      const tall = lag('text', {
        x: p.x + 50, y: PALL_BUNN - p.hoyde + 45, 'text-anchor': 'middle',
        'font-size': 34, 'font-weight': 'bold', fill: '#5a4a2a',
      }, pall);
      tall.textContent = rang + 1;
      x = p.x + 50;
      y = PALL_BUNN - p.hoyde - 23;
    } else {
      x = 410;
      y = PALL_BUNN - 23;
    }

    const navn = lag('text', {
      x, y: PALL_BUNN + 22, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 'bold', fill: '#333',
    }, pall);
    navn.textContent = kortNavn(spiller.navn);

    const g = lag('g', { transform: `translate(${x} ${y}) scale(1.6)` }, pall);
    const kropp = lag('g', { class: 'mus-kropp', style: `animation-delay: ${-rang * 0.7}s` }, g);
    tegnMus(kropp, spiller.farge, spiller.pynt);
    if (rang === 0) startSalto(g, x, y, 1.6, nr);
    if (rang === 3) lagTaarer(kropp);
  });

  pall.setAttribute('aria-label', `Resultat: ${rekkefolge.map((i, r) => `${r + 1}. ${spillere[i].navn}`).join(', ')}`);
}

// ---------- Startskjerm ----------
// Lager ett navnefelt per spiller, med musen spilleren får og valg av pynt ved siden av
function visNavnefelt() {
  const skrevet = [...navnefelt.querySelectorAll('input')].map((f) => f.value);
  const valgtPynt = [...navnefelt.querySelectorAll('select')].map((f) => f.value);
  navnefelt.innerHTML = '';

  for (let i = 0; i < antallValgt; i++) {
    const rad = document.createElement('div');
    rad.className = 'navnerad';

    const pyntValg = document.createElement('select');
    pyntValg.setAttribute('aria-label', `Pynt på musen til spiller ${i + 1}`);
    PYNT.forEach((p) => {
      const valg = document.createElement('option');
      valg.value = p.id;
      valg.textContent = p.navn;
      pyntValg.appendChild(valg);
    });
    pyntValg.value = valgtPynt[i] || 'ingen';

    let ikon = lagMuseikon(MUSER[i].farge, pyntValg.value);
    pyntValg.addEventListener('change', () => {
      const nyttIkon = lagMuseikon(MUSER[i].farge, pyntValg.value);
      ikon.replaceWith(nyttIkon);
      ikon = nyttIkon;
    });

    const felt = document.createElement('input');
    felt.type = 'text';
    felt.maxLength = 20;
    felt.placeholder = MUSER[i].navn;
    felt.value = skrevet[i] || '';
    felt.setAttribute('aria-label', `Navn på spiller ${i + 1}`);

    rad.append(ikon, felt, pyntValg);
    navnefelt.appendChild(rad);
  }
  oppdaterValgknapper();
}

function oppdaterValgknapper() {
  antallValg.querySelectorAll('button').forEach((knapp) => {
    knapp.classList.toggle('valgt', Number(knapp.dataset.antall) === antallValgt);
  });
  brettValg.querySelectorAll('button').forEach((knapp) => {
    knapp.classList.toggle('valgt', knapp.dataset.brett === brettValgt);
  });
}

function startSpillet(hendelse) {
  hendelse.preventDefault();
  spillere = [...navnefelt.querySelectorAll('.navnerad')].map((rad, i) => ({
    navn: rad.querySelector('input').value.trim() || MUSER[i].navn,
    farge: MUSER[i].farge,
    pynt: rad.querySelector('select').value,
  }));
  // Musikken starter når spillet starter, hvis ingen har skrudd den av med knappen
  if (!musikkValgt && !musikkPaa) spillMusikk();
  startNyttSpill();
}

// Starter en ny runde med spillerne som er valgt (brukes også av «Spill igjen»)
function startNyttSpill() {
  feiringNr++;
  const valgtBrett = BRETT[brettValgt];
  antallSteg = valgtBrett.antallSteg;
  steg = lagSpiralPunkter(antallSteg, valgtBrett.omganger);
  plasser = [...steg, { x: SENTER, y: SENTER }]; // siste plass = osten
  plasserSpesialfelt();

  posisjoner = spillere.map(() => 0);
  staOver = spillere.map(() => false);
  tur = 0;
  ferdig = false;
  opptatt = false;
  kastKnapp.disabled = false;
  kastKnapp.hidden = false;
  pallKnapp.hidden = true;
  hendelseTekst.textContent = '';

  startskjerm.hidden = true;
  resultat.hidden = true;
  spillet.hidden = false;
  tegnBrett();
  tegnMusene();
  visTerning(null);
  oppdaterStatus();
}

function tilbakeTilLobby() {
  feiringNr++;
  resultat.hidden = true;
  spillet.hidden = true;
  startskjerm.hidden = false;
}

antallValg.addEventListener('click', (hendelse) => {
  const knapp = hendelse.target.closest('button');
  if (!knapp) return;
  antallValgt = Number(knapp.dataset.antall);
  visNavnefelt();
});

brettValg.addEventListener('click', (hendelse) => {
  const knapp = hendelse.target.closest('button');
  if (!knapp) return;
  brettValgt = knapp.dataset.brett;
  oppdaterValgknapper();
});

// ---------- Start ----------
REAKSJONER.forEach((emoji) => {
  const knapp = document.createElement('button');
  knapp.type = 'button';
  knapp.className = 'emoji-knapp';
  knapp.textContent = emoji;
  knapp.setAttribute('aria-label', `Send ${emoji}`);
  knapp.addEventListener('click', () => sendReaksjon(emoji));
  reaksjoner.appendChild(knapp);
});

lydKnapp.addEventListener('click', () => {
  lydPaa = !lydPaa;
  oppdaterLydKnapper();
});

musikkKnapp.addEventListener('click', () => {
  musikkValgt = true;
  if (musikkPaa) {
    musikkPaa = false;
    musikk.pause();
    oppdaterLydKnapper();
  } else {
    spillMusikk();
  }
});

volumSlider.addEventListener('input', () => {
  musikk.volume = Number(volumSlider.value);
});

visNavnefelt();
oppdaterLydKnapper();
navneskjema.addEventListener('submit', startSpillet);
kastKnapp.addEventListener('click', kastTerning);
pallKnapp.addEventListener('click', visPallen);
spillIgjenKnapp.addEventListener('click', startNyttSpill);
lobbyKnapp.addEventListener('click', tilbakeTilLobby);