// Dice-Mice! – det som skjer i nettleseren: tegning, animasjon, lyd og knapper.
// Spillreglene ligger på serveren (spillregler.js). Nettleseren sender bare ønsker («kast»)
// og spiller av hendelsene serveren sender tilbake (se spillAv).

// ---------- Innstillinger ----------
// Musen får fargen sin av serveren (mus = 0–3). Navnet brukes hvis spilleren ikke skriver inn noe.
// prikk: fargen på prikkene på musens terning i en duell (lys på mørk mus, mørk på lys mus)
const MUSER = [
  { navn: 'Grå mus',   farge: '#9a9a9a', prikk: '#222' },
  { navn: 'Brun mus',  farge: '#a0703c', prikk: '#fff' },
  { navn: 'Hvit mus',  farge: '#f5f5f5', prikk: '#333' },
  { navn: 'Svart mus', farge: '#444444', prikk: '#fff' },
];

// Pynt musene kan ha på seg (velges på startskjermen)
const PYNT = [
  { id: 'ingen',   navn: 'Ingen pynt' },
  { id: 'hatt',    navn: 'Partyhatt' },
  { id: 'krone',   navn: 'Krone' },
  { id: 'sloyfe',  navn: 'Sløyfe' },
  { id: 'briller', navn: 'Briller' },
];

// Spesialfelt: utseende og tekst. Hva de gjør, bestemmer serveren (spillregler.js).
const SPESIALFELT = {
  frem:    { ikon: '⏩', farge: '#bfe3b4', tekst: (n) => `${n} fant ostesmuler og hopper 3 felt frem!` },
  tilbake: { ikon: '⏪', farge: '#f4b6b6', tekst: (n) => `${n} gikk i en musefelle og må 3 felt tilbake!` },
  igjen:   { ikon: '🎲', farge: '#ffe08a', tekst: (n) => `${n} får kaste igjen!` },
  // Kattefeltet har ikke ikon på feltet: en sovende katt ligger ved siden av (se tegnKatt)
  over:    { ikon: '😾', farge: '#c9d7f0', tekst: (n) => `${n} vekket katten! Den ble sur, og ${n} står over neste runde.` },
};
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
// En kopi av det serveren vet, som oppdateres mens hendelsene spilles av.
// Posisjon 0 = START, antallSteg = osten i midten
let spillere = [];      // fra serveren: { navn, farge, prikk, pynt, tilkoblet }
let posisjoner = [];
let staOver = [];       // sant for en spiller som må stå over neste runde
let tur = 0;
let ferdig = false;
let opptatt = false;    // sant fra man trykker «Kast terningen» til serveren har svart
let brettValgt = 'vanlig';

// Rommet
let meg = -1;           // mitt eget spillernummer i rommet
let erVert = false;     // sant for den som opprettet rommet (velger brett og starter)
let spillId = '';       // romkode + spillnummer, så nettleseren ser når et nytt spill starter
let hendelseKo = Promise.resolve(); // det serveren sender, spilles av én ting om gangen
let iKoen = 0;          // hvor mange ting som venter på å bli spilt av

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
const opprettSkjema = document.getElementById('opprettSkjema');
const bliMedSkjema = document.getElementById('bliMedSkjema');
const mittIkon = document.getElementById('mittIkon');
const mittNavn = document.getElementById('mittNavn');
const minPynt = document.getElementById('minPynt');
const kodeFelt = document.getElementById('kodeFelt');
const feilmelding = document.getElementById('feilmelding');
const lobby = document.getElementById('lobby');
const romkode = document.getElementById('romkode');
const lobbyliste = document.getElementById('lobbyliste');
const brettValg = document.getElementById('brettValg');
const startKnapp = document.getElementById('startKnapp');
const lobbyVenter = document.getElementById('lobbyVenter');
const resultatVenter = document.getElementById('resultatVenter');
const spillet = document.getElementById('spillet');
const brettramme = document.getElementById('brettramme');
const brett = document.getElementById('brett');
const statusTekst = document.getElementById('status');
const hendelseTekst = document.getElementById('hendelse');
const terning = document.getElementById('terning');
const terningTekst = document.getElementById('terningTekst');   // usynlig tekst som skjermleseren leser opp
const kastKnapp = document.getElementById('kast');
const pallKnapp = document.getElementById('tilPallen');
const spillerliste = document.getElementById('spillerliste');
const reaksjoner = document.getElementById('reaksjoner');
const resultat = document.getElementById('resultat');
const resultatTittel = document.getElementById('resultatTittel');
const pall = document.getElementById('pall');
const spillIgjenKnapp = document.getElementById('spillIgjen');
const lobbyKnapp = document.getElementById('tilLobby');
const lydKnapp = document.getElementById('lydKnapp');
const musikkKnapp = document.getElementById('musikkKnapp');
const volumValg = document.getElementById('volumValg');
const volumSlider = document.getElementById('volum');
const duellBoks = document.getElementById('duell');
const duellTerninger = [...duellBoks.querySelectorAll('.duell-terning')];
const duellNavn = [...duellBoks.querySelectorAll('.duell-navn')];
const duellKnapper = [...duellBoks.querySelectorAll('.duell-kast')];
const duellMelding = duellBoks.querySelector('.duell-melding');

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

// Ett sverd som slår mot et annet: et skarpt klakk og en metallisk klang som dør ut
function sverdKling(start) {
  klakk(start, { frekvens: 4200, volum: 0.35, varighet: 0.05 });
  tone(1760, start, 0.35, { type: 'triangle', volum: 0.1, tilFrekvens: 1500 });
  tone(2640, start, 0.2, { type: 'square', volum: 0.03 });
}

const lyd = {
  terning: () => terningRuller(TRILLE_TID / 1000),
  duell: () => { sverdKling(0); sverdKling(0.22); },
  duellSeier: () => [659, 880].forEach((f, i) => tone(f, i * 0.1, 0.18, { type: 'triangle', volum: 0.2 })),
  hopp: () => tone(320, 0, 0.12, { tilFrekvens: 640, volum: 0.12 }),
  frem: () => [523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.15)),
  tilbake: () => [784, 659, 523].forEach((f, i) => tone(f, i * 0.08, 0.15)),
  igjen: () => { tone(660, 0, 0.1); tone(880, 0.12, 0.15); },
  over: () => hvese(),
  reaksjon: () => tone(880, 0, 0.08, { volum: 0.1 }),
  seier: () => [523, 659, 784, 1047].forEach((f, i) =>
    tone(f, i * 0.15, i === 3 ? 0.6 : 0.18, { type: 'triangle', volum: 0.25 })),
};

// Musikk: sangen ligger i public/assets/audio/tema.mp3 (stien er regnet fra public/, der index.html ligger).
// Musikk-knappen og volumet vises bare når filen finnes.
const musikk = new Audio();
musikk.loop = true;
musikk.volume = Number(volumSlider.value);
musikk.preload = 'auto';
musikk.addEventListener('canplay', () => {
  musikkKnapp.hidden = false;
  volumValg.hidden = false;
}, { once: true });
musikk.src = 'assets/audio/tema.mp3';
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
  // Sint øyenbryn: vises bare under en duell (se .sint .mus-sint i style.css)
  lag('path', { d: 'M 14.5 -9 L 21 -6.5', class: 'mus-sint', stroke: '#222', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
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
  beskrivBrettet();
}

// Forteller skjermleseren hvor musene står (brettet har role="img", så dette er det som leses)
function beskrivBrettet() {
  const plassering = spillere.map((spiller, i) => {
    if (posisjoner[i] >= antallSteg) return `${spiller.navn} ved osten`;
    if (posisjoner[i] === 0) return `${spiller.navn} på START`;
    return `${spiller.navn} på felt ${posisjoner[i]} av ${antallSteg}`;
  });
  brett.setAttribute('aria-label', `Spillbrettet: ${plassering.join(', ')}.`);
}

// ---------- Bevegelse ----------
// Ett hopp i en bue fra ett punkt til et annet.
// Med redusert bevegelse glir musen rett til neste felt, uten bue.
function hopp(g, fra, til) {
  const bue = reduserBevegelse() ? 0 : HOPP_HOYDE;
  return new Promise((ferdigHopp) => {
    const start = performance.now();
    function ramme(naa) {
      const t = Math.min((naa - start) / HOPP_TID, 1);
      const x = fra.x + (til.x - fra.x) * t;
      const y = fra.y + (til.y - fra.y) * t - Math.sin(t * Math.PI) * bue;
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

// Viser et tall på en terning (den vanlige, eller en av duellterningene).
// navn er det skjermleseren kaller terningen. Duellterningene har navnet sitt i data-navn
// («Grå mus sin terning»), så de heter det samme også mens de ruller.
function visTerning(verdi, el = terning, navn = el.dataset.navn || 'Terningen') {
  el.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const celle = document.createElement('div');
    if (verdi && PRIKKER[verdi].includes(i)) celle.className = 'prikk';
    el.appendChild(celle);
  }
  el.setAttribute('aria-label', verdi ? `${navn} viser ${verdi}` : navn);
}

// Terningene ruller samtidig og viser tilfeldige tall en liten stund.
// Med redusert bevegelse står de stille i stedet for å blinke med tilfeldige tall.
function trillTerninger(terninger) {
  return new Promise((ferdigTrilla) => {
    terninger.forEach((el) => el.classList.add('triller'));
    lyd.terning();
    const bytt = reduserBevegelse() ? null : setInterval(() => {
      terninger.forEach((el) => visTerning(1 + Math.floor(Math.random() * 6), el));
    }, 80);
    setTimeout(() => {
      clearInterval(bytt);
      terninger.forEach((el) => el.classList.remove('triller'));
      ferdigTrilla();
    }, TRILLE_TID);
  });
}

function trillTerning() {
  return trillTerninger([terning]);
}

// Viser hvem som er med, og hvem sin tur det er.
// Bare utseende: musikonet i en sirkel i musens farge, «Din tur»-merkelapp og 💤 for den som står over.
let sistVisteTur = -1;  // brukes så den nye spilleren bare spretter inn når turen faktisk bytter

function visSpillerliste() {
  spillerliste.innerHTML = '';
  spillere.forEach((spiller, i) => {
    const rad = lagSpillerRad(spiller, i);

    if (staOver[i]) {
      rad.classList.add('staar-over');
      const merke = document.createElement('span');
      merke.className = 'merke-over';
      merke.textContent = '💤';
      merke.title = 'Står over neste runde';
      merke.setAttribute('aria-hidden', 'true');
      rad.append(merke, lagSkjultTekst(' (står over neste runde)'));
    }
    if (i === tur) {
      rad.classList.add('aktiv');
      rad.setAttribute('aria-current', 'true');
      if (tur !== sistVisteTur) rad.classList.add('sprett');
      const merkelapp = document.createElement('span');
      merkelapp.className = 'din-tur';
      merkelapp.setAttribute('aria-hidden', 'true');
      merkelapp.textContent = '🎲 Din tur';
      rad.append(merkelapp, lagSkjultTekst(' (har tur)'));
    }
    spillerliste.appendChild(rad);
  });
  sistVisteTur = tur;
}

// Én «pille» med musikonet og navnet (brukes i spillerlisten og i lobbyen)
function lagSpillerRad(spiller, i) {
  const rad = document.createElement('li');
  rad.style.setProperty('--musefarge', spiller.farge);
  rad.classList.toggle('borte', !spiller.tilkoblet);

  const ikon = document.createElement('span');
  ikon.className = 'spiller-ikon';
  ikon.append(lagMuseikon(spiller.farge, spiller.pynt));

  const navn = document.createElement('span');
  navn.className = 'spiller-navn';
  navn.textContent = spiller.navn;
  rad.append(ikon, navn, ...merkelapperForRom(i));
  return rad;
}

// Små merkelapper bak navnet: «(deg)» på min egen mus, og «(har gått)» hvis spilleren har lukket siden.
// Spilleren som har gått, blir også litt gjennomsiktig (se .borte i style.css).
function merkelapperForRom(i) {
  const merker = [];
  if (i === meg) merker.push(lagMerke(' (deg)', 'deg'));
  if (spillere[i] && !spillere[i].tilkoblet) {
    merker.push(lagMerke(' (har gått)', 'borte-tekst'));
  }
  return merker;
}

function lagMerke(tekst, klasse) {
  const span = document.createElement('span');
  span.className = klasse;
  span.textContent = tekst;
  return span;
}

// Tekst som bare skjermlesere får med seg (se .skjult-tekst i style.css)
function lagSkjultTekst(tekst) {
  const span = document.createElement('span');
  span.className = 'skjult-tekst';
  span.textContent = tekst;
  return span;
}

// Statusteksten sier hvem som har tur. Har jeg selv tur, står det «Din tur, <navn>!».
function oppdaterStatus() {
  const navn = spillere[tur].navn;
  statusTekst.textContent = tur === meg ? `Din tur, ${navn}!` : `${navn} sin tur`;
  statusTekst.style.setProperty('--turfarge', spillere[tur].farge); // fargen på prikken foran teksten
  visSpillerliste();
  oppdaterKastKnapp();
}

// «Kast terningen» kan bare trykkes av den som har tur, og bare når alt er spilt av.
// aria-disabled i stedet for disabled: knappen ser deaktivert ut og trykk avvises,
// men den beholder fokus, så tastaturbrukere kan trykke Enter igjen når det blir deres tur.
function oppdaterKastKnapp() {
  const kanKaste = !ferdig && !opptatt && tur === meg && iKoen === 0 && duellBoks.hidden;
  if (kanKaste) kastKnapp.removeAttribute('aria-disabled');
  else kastKnapp.setAttribute('aria-disabled', 'true');
}

// Legger en ny linje til teksten om hva som skjedde.
// Typen (frem, tilbake, igjen, over, duell) gir snakkeboblen farge; den første hendelsen bestemmer fargen.
// Blir teksten for høy for den faste plassen (f.eks. ⏩ + duell + sekser med lange navn),
// får boblen mindre skrift (først «liten», så «minst»), så «Kast terningen» under ikke flytter seg.
// Høyden måles alltid med vanlig skrift først, så boblen ikke får for stor skrift når det kommer mer tekst.
const BOBLE_STORRELSER = ['liten', 'minst'];

function leggTilHendelse(tekst, type) {
  hendelseTekst.textContent = [hendelseTekst.textContent, tekst].join(' ').trim();
  if (!hendelseTekst.dataset.type) hendelseTekst.dataset.type = type;
  const plass = parseFloat(getComputedStyle(hendelseTekst.parentNode).minHeight);
  hendelseTekst.classList.remove(...BOBLE_STORRELSER);
  for (const storrelse of BOBLE_STORRELSER) {
    if (hendelseTekst.offsetHeight <= plass) break;
    hendelseTekst.classList.remove(...BOBLE_STORRELSER);
    hendelseTekst.classList.add(storrelse);
  }
}

function tomHendelse() {
  hendelseTekst.textContent = '';
  hendelseTekst.classList.remove(...BOBLE_STORRELSER);
  delete hendelseTekst.dataset.type;
}

// ---------- Museduell ----------
// Serveren bestemmer når det blir duell og hva terningene viser. Her vises det.
// Hver spiller kaster med sin egen «Kast»-knapp på sin egen enhet. Knappen til den andre er deaktivert.

// Musene i duellen stiller seg side om side på feltet og snur seg mot hverandre:
// den som har tur (a) står til venstre og ser mot høyre, motstanderen (b) står til høyre og speilvendes.
// (Står flere mus på feltet, kan de ellers stå rett over hverandre.)
// Så langt fra midten av feltet hver mus står. Nesen er ca. 25 fra midten av musen,
// så 30 gir ca. 10 i luft mellom nesene: de ser på hverandre uten å røre hverandre.
const DUELL_AVSTAND = 30;

let duellSider = [];          // spillernumrene i duellen: [den som har tur, motstanderen]
let duellKastene = [null, null]; // tallene i runden som pågår

function stillOppTilDuell(a, b) {
  const plass = plasser[posisjoner[a]];
  const y = plass.y - 4;
  museGrupper[a].setAttribute('transform', `translate(${plass.x - DUELL_AVSTAND} ${y})`);
  museGrupper[b].setAttribute('transform', `translate(${plass.x + DUELL_AVSTAND} ${y}) scale(-1 1)`);
  museGrupper[a].parentNode.appendChild(museGrupper[a]); // begge tegnes over andre mus på feltet
  museGrupper[b].parentNode.appendChild(museGrupper[b]);
}

// Ny runde i duellen: tomme terninger, og bare min egen «Kast»-knapp kan trykkes
function nyDuellRunde() {
  duellKastene = [null, null];
  duellKnapper.forEach((knapp, k) => {
    visTerning(null, duellTerninger[k]); // tom terning, så de gamle tallene ikke står igjen etter likt
    if (duellSider[k] === meg) knapp.removeAttribute('aria-disabled');
    else knapp.setAttribute('aria-disabled', 'true');
  });
  const min = duellSider.indexOf(meg);
  if (min >= 0) duellKnapper[min].focus({ preventScroll: true });
}

// Duellen starter: boksen vises, og musene ser sint på hverandre
async function startDuell(a, b) {
  duellSider = [a, b];
  const navnA = spillere[a].navn;
  const navnB = spillere[b].navn;
  duellSider.forEach((nr, k) => {
    duellNavn[k].textContent = spillere[nr].navn;
    duellKnapper[k].setAttribute('aria-label', `Kast for ${spillere[nr].navn}`);
    duellKnapper[k].setAttribute('aria-disabled', 'true');
    duellTerninger[k].dataset.navn = `${spillere[nr].navn} sin terning`;
    duellTerninger[k].style.setProperty('--terningfarge', spillere[nr].farge);
    duellTerninger[k].style.setProperty('--prikkfarge', spillere[nr].prikk);
    visTerning(null, duellTerninger[k]);
    museGrupper[nr].classList.add('sint'); // sinte øyenbryn og risting (se style.css)
  });
  stillOppTilDuell(a, b);
  // Boksen legges på motsatt halvdel av brettet fra duellfeltet, så den ikke dekker musene
  const iOvreHalvdel = plasser[posisjoner[a]].y < SENTER;
  duellBoks.classList.toggle('nede', iOvreHalvdel);
  duellBoks.classList.toggle('oppe', !iOvreHalvdel);
  duellMelding.textContent = '';
  duellBoks.hidden = false;
  oppdaterKastKnapp();
  lyd.duell();
  // Skjermleseren får vite at det er duell og mot hvem. Litt pause før fokus flyttes til
  // kast-knappen, så meldingen ikke blir avbrutt.
  terningTekst.textContent = `⚔️ Duell! ${navnA} mot ${navnB}. Hver spiller trykker på sin egen Kast-knapp.`;
  await vent(600);
  nyDuellRunde();
}

// En av de to har kastet (side 0 = den som har tur, side 1 = motstanderen)
async function visDuellKast(side, verdi) {
  duellKnapper[side].setAttribute('aria-disabled', 'true');
  await trillTerninger([duellTerninger[side]]);
  visTerning(verdi, duellTerninger[side]);
  duellKastene[side] = verdi;
  if (duellKastene[1 - side] === null) {
    // Bare det første kastet leses opp alene; det andre kommer i oppsummeringen etter runden
    terningTekst.textContent = `${spillere[duellSider[side]].navn} slo ${verdi} i duellen.`;
  }
}

function duellOppsummering() {
  const [a, b] = duellSider;
  return `Duell: ${spillere[a].navn} slo ${duellKastene[0]}, ${spillere[b].navn} slo ${duellKastene[1]}.`;
}

// Likt: begge må kaste på nytt
async function duellLikt() {
  terningTekst.textContent = `${duellOppsummering()} Likt – kast igjen!`;
  duellMelding.textContent = 'Likt – kast igjen!';
  await vent(900);
  duellMelding.textContent = '';
  nyDuellRunde();
}

// Duellen er avgjort. Musene flytter seg etterpå (det er egne flytt-hendelser).
async function avsluttDuell({ vinner, taper, frem, tilbake }) {
  // Skjermleseren får også vite hvordan musene flytter seg (det ser man ellers bare på brettet)
  terningTekst.textContent = `${duellOppsummering()} ${spillere[vinner].navn} vant og går ${frem} felt frem.`
    + (tilbake ? ` ${spillere[taper].navn} går ${tilbake} felt tilbake.` : '');
  duellMelding.textContent = `${spillere[vinner].navn} vant!`;
  lyd.duellSeier();
  await vent(1000);
  // Fokus tilbake til «Kast terningen» før boksen skjules, så det ikke forsvinner med knappene
  if (duellBoks.contains(document.activeElement)) kastKnapp.focus({ preventScroll: true });
  duellBoks.hidden = true;
  tegnMusene(); // musene snur seg tilbake og blir glade/rolige igjen
  leggTilHendelse(`⚔️ ${spillere[vinner].navn} vant duellen mot ${spillere[taper].navn}!`, 'duell');
}

// ---------- Hendelser fra serveren ----------
// Serveren sender en liste med hendelser etter hvert kast. De spilles av én og én, i rekkefølge.
// iKo sørger for at det neste fra serveren venter til det forrige er ferdig spilt av.
function iKo(oppgave) {
  iKoen++;
  hendelseKo = hendelseKo
    .then(oppgave)
    .catch((feil) => console.error(feil))
    .finally(() => {
      iKoen--;
      oppdaterKastKnapp();
    });
}

async function spillAv(h) {
  const navn = (i) => spillere[i].navn;
  if (h.type === 'kast') {
    tomHendelse();
    terningTekst.textContent = '';
    await trillTerning();
    visTerning(h.verdi);
    terningTekst.textContent = `${navn(h.spiller)} slo ${h.verdi}.`; // leses opp av skjermleseren
  } else if (h.type === 'flytt') {
    await flyttMus(h.spiller, h.antall, h.retning);
  } else if (h.type === 'spesial') {
    const felt = SPESIALFELT[h.felttype];
    leggTilHendelse(`${felt.ikon} ${felt.tekst(navn(h.spiller))}`, h.felttype);
    lyd[h.felttype]();
    if (h.felttype === 'over') {
      vekkKatt(h.felt);
      staOver[h.spiller] = true;
    }
  } else if (h.type === 'duellStart') {
    await startDuell(h.a, h.b);
  } else if (h.type === 'duellKast') {
    await visDuellKast(h.side, h.verdi);
  } else if (h.type === 'duellLikt') {
    await duellLikt();
  } else if (h.type === 'duellFerdig') {
    await avsluttDuell(h);
  } else if (h.type === 'duellGlad') {
    // Vinneren hopper av glede (flyttMus tegner musene på nytt, så klassen settes etterpå)
    museGrupper[h.spiller].classList.add('glad');
  } else if (h.type === 'sekser') {
    leggTilHendelse(`🎲 ${navn(h.spiller)} slo 6 og kaster igjen!`, 'igjen');
    lyd.igjen();
  } else if (h.type === 'nesteTur') {
    h.stoOver.forEach((i) => {
      staOver[i] = false;
      leggTilHendelse(`😾 ${navn(i)} står over denne runden.`, 'over');
    });
    tur = h.tur;
    oppdaterStatus();
  } else if (h.type === 'seier') {
    visSeier(h.spiller);
  }
}

// Etter hendelsene: bruker tilstanden fra serveren, i tilfelle noe ikke stemmer
function brukSpill(spill) {
  const flyttet = spill.posisjoner.some((p, i) => p !== posisjoner[i]);
  posisjoner = [...spill.posisjoner];
  staOver = [...spill.staOver];
  tur = spill.tur;
  ferdig = spill.ferdig;
  if (flyttet) tegnMusene();
  if (!ferdig) oppdaterStatus();
}

// Den som er ved osten, har vunnet – i en duell kan det være en annen enn den som har tur
function visSeier(vinnerNr) {
  ferdig = true;
  // tur settes til vinneren, så spillerlisten, prikken foran statusteksten og pallen (visPallen) viser riktig mus
  tur = vinnerNr;
  statusTekst.textContent = vinnerNr === meg
    ? `Du kom først til osten og vant, ${spillere[vinnerNr].navn}!`
    : `${spillere[vinnerNr].navn} kom først til osten og vant!`;
  statusTekst.style.setProperty('--turfarge', spillere[vinnerNr].farge);
  visSpillerliste();
  kastKnapp.hidden = true;
  kastKnapp.removeAttribute('aria-disabled');
  pallKnapp.hidden = false;
  pallKnapp.focus(); // fokus flyttes til «Se pallen 🏆», så det ikke forsvinner med «Kast terningen»
  feirSeier(vinnerNr);
}

// Jeg trykker «Kast terningen»: ber serveren om å kaste. Serveren svarer nei hvis det ikke er min tur.
function kastTerning() {
  if (kastKnapp.getAttribute('aria-disabled') === 'true') return;
  opptatt = true;
  oppdaterKastKnapp();
  socket.emit('kast', (godtatt) => {
    if (!godtatt) {
      opptatt = false;
      oppdaterKastKnapp();
    }
  });
}

// Jeg trykker på min egen «Kast»-knapp i duellen
duellKnapper.forEach((knapp) => {
  knapp.addEventListener('click', () => {
    if (knapp.getAttribute('aria-disabled') === 'true') return; // ikke min knapp, eller allerede kastet
    knapp.setAttribute('aria-disabled', 'true');
    socket.emit('duellKast', (godtatt) => {
      if (!godtatt) knapp.removeAttribute('aria-disabled');
    });
  });
});

// En emoji flyter opp over brettet (hos alle i rommet)
function visReaksjon(emoji) {
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
  resultatTittel.focus(); // fokus til «Resultat», så det ikke forsvinner og skjermleseren sier hvor man er
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

// ---------- Startskjerm og lobby ----------
// Pyntvalget på startskjermen, med musen ved siden av. Fargen får man først når man er i et rom,
// så her vises den grå musen.
function lagPyntvalg() {
  PYNT.forEach((p) => {
    const valg = document.createElement('option');
    valg.value = p.id;
    valg.textContent = p.navn;
    minPynt.appendChild(valg);
  });
  visMittIkon();
  minPynt.addEventListener('change', visMittIkon);
}

function visMittIkon() {
  mittIkon.replaceChildren(lagMuseikon(MUSER[0].farge, minPynt.value));
}

function visFeil(tekst) {
  feilmelding.textContent = tekst;
}

// Det serveren trenger for å lage spilleren min
function minSpiller() {
  return { navn: mittNavn.value, pynt: minPynt.value };
}

// «Opprett spill»: serveren lager et rom med kode, og jeg blir verten
function opprettSpill(hendelse) {
  hendelse.preventDefault();
  visFeil('');
  socket.emit('opprett', minSpiller(), (svar) => {
    if (!svar.ok) visFeil(svar.feil);
  });
}

// «Bli med»: blir med i et rom med koden de andre har fått
function bliMed(hendelse) {
  hendelse.preventDefault();
  const kode = kodeFelt.value.trim().toUpperCase();
  if (!kode) {
    visFeil('Skriv inn koden du har fått.');
    kodeFelt.focus();
    return;
  }
  visFeil('');
  socket.emit('bliMed', { ...minSpiller(), kode }, (svar) => {
    if (!svar.ok) {
      visFeil(svar.feil);
      kodeFelt.focus();
    }
  });
}

function oppdaterValgknapper() {
  // Den valgte knappen får både farge og aria-pressed, så skjermleseren sier hvilken som er valgt.
  // Bare verten kan velge brett; de andre ser hva verten har valgt.
  brettValg.querySelectorAll('button').forEach((knapp) => {
    const valgt = knapp.dataset.brett === brettValgt;
    knapp.classList.toggle('valgt', valgt);
    knapp.setAttribute('aria-pressed', String(valgt));
    knapp.disabled = !erVert;
  });
}

// Viser lobbyen i rommet: koden, hvem som er med, og brettet verten har valgt
function visLobby(rom) {
  const varSkjult = lobby.hidden;
  feiringNr++; // stopper backflips og konfetti hvis man kommer fra pallen
  startskjerm.hidden = true;
  spillet.hidden = true;
  resultat.hidden = true;
  lobby.hidden = false;
  spillId = '';

  romkode.textContent = rom.kode;
  lobbyliste.replaceChildren(...spillere.map((spiller, i) => {
    const rad = lagSpillerRad(spiller, i);
    if (i === rom.vert) rad.append(lagMerke('👑 Vert', 'vert-merke'));
    return rad;
  }));
  brettValgt = rom.brett;
  oppdaterValgknapper();
  startKnapp.hidden = !erVert;
  lobbyVenter.hidden = erVert;
  // Fokus flyttes bare når lobbyen vises, ikke hver gang noen blir med
  if (varSkjult) (erVert ? startKnapp : romkode).focus();
}

// Starter et nytt spill med tilstanden fra serveren (også ved «Spill igjen»)
function startNyttSpill(spill) {
  feiringNr++;
  antallSteg = spill.antallSteg;
  steg = lagSpiralPunkter(antallSteg, spill.omganger);
  plasser = [...steg, { x: SENTER, y: SENTER }]; // siste plass = osten
  spesial = spill.spesial;

  posisjoner = [...spill.posisjoner];
  staOver = [...spill.staOver];
  tur = spill.tur;
  ferdig = spill.ferdig;
  opptatt = false;
  kastKnapp.hidden = false;
  pallKnapp.hidden = true;
  tomHendelse();
  terningTekst.textContent = '';
  duellBoks.hidden = true;
  sistVisteTur = -1; // den første spilleren spretter inn når spillet starter

  startskjerm.hidden = true;
  lobby.hidden = true;
  resultat.hidden = true;
  spillet.hidden = false;
  tegnBrett();
  tegnMusene();
  visTerning(null);
  oppdaterStatus();
  // Musikken starter når spillet starter, hvis ingen har skrudd den av med knappen
  if (!musikkValgt && !musikkPaa) spillMusikk();
  // Fokus til «Kast terningen», så det ikke forsvinner når lobbyen eller pallen skjules.
  // preventScroll: siden skal ikke hoppe ned til knappen på telefon.
  kastKnapp.focus({ preventScroll: true });
}

// Serveren sender rommet hver gang noe endrer seg (noen blir med eller går, nytt spill, tilbake til lobby)
function visRom(rom) {
  meg = rom.meg;
  erVert = rom.vert === meg;
  spillere = rom.spillere.map((s) => ({
    navn: s.navn,
    farge: MUSER[s.mus].farge,
    prikk: MUSER[s.mus].prikk,
    pynt: s.pynt,
    tilkoblet: s.tilkoblet,
  }));
  // Etter spillet er det bare verten som velger «Spill igjen» eller «Tilbake til lobby»
  spillIgjenKnapp.hidden = !erVert;
  lobbyKnapp.hidden = !erVert;
  resultatVenter.hidden = erVert;

  if (rom.fase === 'lobby') {
    visLobby(rom);
    return;
  }
  const nyId = `${rom.kode}-${rom.spillNr}`;
  if (nyId !== spillId) {
    spillId = nyId;
    startNyttSpill(rom.spill);
  } else {
    visSpillerliste(); // f.eks. en spiller har gått
  }
}

// Mister nettleseren linjen til serveren, er man ute av rommet og må begynne på nytt
function forbindelsenBrutt() {
  if (meg < 0) return; // ikke i noe rom ennå: socket.io kobler til igjen av seg selv
  feiringNr++;
  meg = -1;
  erVert = false;
  spillId = '';
  lobby.hidden = true;
  spillet.hidden = true;
  resultat.hidden = true;
  startskjerm.hidden = false;
  visFeil('Forbindelsen til serveren ble brutt. Opprett eller bli med i et spill på nytt.');
}

// ---------- Forbindelsen til serveren ----------
// io() kommer fra /socket.io/socket.io.js og kobler til serveren siden ble lastet fra
const socket = io();

socket.on('rom', (rom) => iKo(() => visRom(rom)));
socket.on('hendelser', ({ hendelser, spill }) => {
  opptatt = false; // serveren har svart på kastet
  iKo(async () => {
    for (const h of hendelser) await spillAv(h);
    brukSpill(spill);
  });
});
socket.on('reaksjon', ({ emoji }) => visReaksjon(emoji));
socket.on('disconnect', forbindelsenBrutt);

// ---------- Start ----------
REAKSJONER.forEach((emoji) => {
  const knapp = document.createElement('button');
  knapp.type = 'button';
  knapp.className = 'emoji-knapp';
  knapp.textContent = emoji;
  knapp.setAttribute('aria-label', `Send ${emoji}`);
  knapp.addEventListener('click', () => {
    socket.emit('reaksjon', emoji); // serveren sender den til alle i rommet, også meg
    // Knappen spretter (se .emoji-knapp.sprett i style.css). Klassen tas av og på igjen,
    // så den spretter på nytt selv om man trykker flere ganger fort.
    knapp.classList.remove('sprett');
    void knapp.offsetWidth;
    knapp.classList.add('sprett');
  });
  knapp.addEventListener('animationend', () => knapp.classList.remove('sprett'));
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

brettValg.addEventListener('click', (hendelse) => {
  const knapp = hendelse.target.closest('button');
  if (!knapp || !erVert) return;
  socket.emit('velgBrett', knapp.dataset.brett);
});

lagPyntvalg();
oppdaterLydKnapper();
opprettSkjema.addEventListener('submit', opprettSpill);
bliMedSkjema.addEventListener('submit', bliMed);
startKnapp.addEventListener('click', () => socket.emit('start'));
kastKnapp.addEventListener('click', kastTerning);
pallKnapp.addEventListener('click', visPallen);
spillIgjenKnapp.addEventListener('click', () => socket.emit('spillIgjen'));
lobbyKnapp.addEventListener('click', () => socket.emit('tilLobby'));
