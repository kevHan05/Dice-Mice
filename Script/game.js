// Dice-Mice! – første utkast (prototype)

// ---------- Innstillinger ----------
const ANTALL_SPILLERE = 2;   // 1–4
const ANTALL_STEG = 40;      // steg på spiralen, inkludert START
const SPILLERE = [
  { navn: 'Grå mus',   farge: '#9a9a9a' },
  { navn: 'Brun mus',  farge: '#a0703c' },
  { navn: 'Hvit mus',  farge: '#f5f5f5' },
  { navn: 'Svart mus', farge: '#444444' },
].slice(0, ANTALL_SPILLERE);

const SENTER = 350;
const YTRE_RADIUS = 300;
const INDRE_RADIUS = 95;
const OMGANGER = 2.5;
const SVG_NS = 'http://www.w3.org/2000/svg';

// ---------- Tilstand ----------
// Posisjon 0 = START, ANTALL_STEG = osten i midten
let posisjoner = SPILLERE.map(() => 0);
let tur = 0;
let ferdig = false;

const brett = document.getElementById('brett');
const statusTekst = document.getElementById('status');
const terning = document.getElementById('terning');
const kastKnapp = document.getElementById('kast');

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
  lag('path', { d: 'M -50 0 L 45 2 L 45 28 L -50 26 Z', fill: '#f2b72c', stroke: '#b07a10', 'stroke-width': 2 }, g); // forside
  lag('path', { d: 'M -50 0 L 32 -30 Q 47 -15 45 2 Z', fill: '#ffd54a', stroke: '#b07a10', 'stroke-width': 2 }, g); // overside
  lag('path', { d: 'M 32 -30 Q 47 -15 45 2 L 45 28 Q 49 0 32 -4 Z', fill: '#e09a1a', stroke: '#b07a10', 'stroke-width': 2 }, g); // skorpe
  // Hull
  lag('ellipse', { cx: -20, cy: 14, rx: 6, ry: 5, fill: '#d99a1c' }, g);
  lag('ellipse', { cx: 15, cy: 18, rx: 4, ry: 3.5, fill: '#d99a1c' }, g);
  lag('ellipse', { cx: 10, cy: -10, rx: 6, ry: 3, fill: '#e6b52e' }, g);
  lag('ellipse', { cx: 30, cy: -14, rx: 3, ry: 1.8, fill: '#e6b52e' }, g);
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

function tegnMusene() {
  const lagMus = document.getElementById('muselag');
  lagMus.innerHTML = '';
  SPILLERE.forEach((spiller, i) => {
    const plass = plasser[posisjoner[i]];
    const samme = posisjoner.filter((p) => p === posisjoner[i]).length;
    const rekkefolge = posisjoner.slice(0, i).filter((p) => p === posisjoner[i]).length;
    const [dx, dy] = samme > 1 ? FORSKYVNING[rekkefolge + 1] : FORSKYVNING[0];
    const g = lag('g', { transform: `translate(${plass.x + dx} ${plass.y + dy - 4})` }, lagMus);
    tegnMus(g, spiller.farge);
  });
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

function oppdaterStatus() {
  statusTekst.textContent = `${SPILLERE[tur].navn} sin tur`;
}

// ---------- Spillogikk ----------
function kastTerning() {
  if (ferdig) return;
  const kast = 1 + Math.floor(Math.random() * 6);
  visTerning(kast);

  posisjoner[tur] = Math.min(posisjoner[tur] + kast, ANTALL_STEG);
  tegnMusene();

  if (posisjoner[tur] === ANTALL_STEG) {
    ferdig = true;
    kastKnapp.disabled = true;
    statusTekst.textContent = `${SPILLERE[tur].navn} kom først til osten og vant!`;
    return;
  }

  tur = (tur + 1) % SPILLERE.length;
  oppdaterStatus();
}

// ---------- Start ----------
tegnBrett();
tegnMusene();
visTerning(null);
oppdaterStatus();
kastKnapp.addEventListener('click', kastTerning);
