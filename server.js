// Dice-Mice! – flerspiller-serveren.
// Express viser spillfilene i public/, og Socket.IO holder en åpen linje til hver spiller.
// Serveren bestemmer: nettleseren sender bare ønsker («kast»), serveren sjekker turen, kaster terningen
// (se spillregler.js) og sender hendelsene og den nye tilstanden til alle i rommet.
// Start: npm start (eller node server.js), og åpne http://localhost:3000

const path = require('path');
const http = require('http');
const os = require('os');
const express = require('express');
const { Server } = require('socket.io');
const regler = require('./spillregler');

const PORT = process.env.PORT || 3000;
const MAKS_SPILLERE = 4;
const MUSENAVN = ['Grå mus', 'Brun mus', 'Hvit mus', 'Svart mus']; // brukes hvis spilleren ikke skriver noe navn
const PYNT = ['ingen', 'hatt', 'krone', 'sloyfe', 'briller'];
const REAKSJONER = ['👍', '😂', '😮', '😢', '🧀', '🎉'];
const KODETEGN = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // uten I og O, så de ikke forveksles med 1 og 0
const KODELENGDE = 4;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);
const io = new Server(server);

// ---------- Rom ----------
// kode -> { kode, vertId, fase: 'lobby' | 'spill', brett, spillNr, spillere: [...], spill }
// En spiller: { id (socket-id), navn, mus (0–3, fargen), pynt, tilkoblet }
const alleRom = new Map();

function lagKode() {
  let kode;
  do {
    kode = '';
    for (let i = 0; i < KODELENGDE; i++) kode += KODETEGN[Math.floor(Math.random() * KODETEGN.length)];
  } while (alleRom.has(kode));
  return kode;
}

// Lager en spiller av det nettleseren sendte. Musen får den første ledige fargen i rommet.
function lagSpiller(id, data, rom) {
  const opptatt = rom.spillere.map((s) => s.mus);
  const mus = [0, 1, 2, 3].find((m) => !opptatt.includes(m));
  const navn = typeof data?.navn === 'string' ? data.navn.trim().slice(0, 20) : '';
  const pynt = PYNT.includes(data?.pynt) ? data.pynt : 'ingen';
  return { id, navn: navn || MUSENAVN[mus], mus, pynt, tilkoblet: true };
}

// Sender rommet til hver spiller, med «meg» = spillerens eget nummer
function sendRom(rom) {
  const felles = {
    kode: rom.kode,
    fase: rom.fase,
    brett: rom.brett,
    spillNr: rom.spillNr,
    vert: rom.spillere.findIndex((s) => s.id === rom.vertId),
    spillere: rom.spillere.map(({ navn, mus, pynt, tilkoblet }) => ({ navn, mus, pynt, tilkoblet })),
    spill: rom.spill,
  };
  rom.spillere.forEach((s, i) => {
    if (s.tilkoblet) io.to(s.id).emit('rom', { ...felles, meg: i });
  });
}

function sendHendelser(rom, hendelser) {
  if (hendelser && hendelser.length) io.to(rom.kode).emit('hendelser', { hendelser, spill: rom.spill });
}

// Fjerner spillere som har lukket siden (gjøres når et nytt spill starter eller man går til lobbyen)
function fjernBorte(rom) {
  rom.spillere = rom.spillere.filter((s) => s.tilkoblet);
}

function startSpill(rom) {
  fjernBorte(rom);
  rom.spill = regler.nyttSpill(rom.spillere.length, rom.brett);
  rom.fase = 'spill';
  rom.spillNr++;
  sendRom(rom);
}

// ---------- Forbindelsen til hver spiller ----------
io.on('connection', (socket) => {
  // Rommet og spillernummeret til denne forbindelsen (null hvis den ikke er i et rom)
  function mittRom() {
    return alleRom.get(socket.data.kode) || null;
  }
  function mittNr(rom) {
    return rom.spillere.findIndex((s) => s.id === socket.id);
  }
  function erVert(rom) {
    return rom.vertId === socket.id;
  }

  // «Opprett spill»: lager et nytt rom, og den som oppretter blir verten
  socket.on('opprett', (data, svar) => {
    if (typeof svar !== 'function' || mittRom()) return;
    const rom = { kode: lagKode(), vertId: socket.id, fase: 'lobby', brett: 'vanlig', spillNr: 0, spillere: [], spill: null };
    rom.spillere.push(lagSpiller(socket.id, data, rom));
    alleRom.set(rom.kode, rom);
    socket.data.kode = rom.kode;
    socket.join(rom.kode);
    svar({ ok: true });
    sendRom(rom);
  });

  // «Bli med»: blir med i et rom med koden
  socket.on('bliMed', (data, svar) => {
    if (typeof svar !== 'function' || mittRom()) return;
    const kode = typeof data?.kode === 'string' ? data.kode.trim().toUpperCase() : '';
    const rom = alleRom.get(kode);
    if (!rom) return svar({ ok: false, feil: `Fant ikke noe spill med koden «${kode}».` });
    if (rom.fase !== 'lobby') return svar({ ok: false, feil: 'Spillet har allerede startet.' });
    if (rom.spillere.length >= MAKS_SPILLERE) return svar({ ok: false, feil: `Spillet er fullt (${MAKS_SPILLERE} spillere).` });
    rom.spillere.push(lagSpiller(socket.id, data, rom));
    socket.data.kode = rom.kode;
    socket.join(rom.kode);
    svar({ ok: true });
    sendRom(rom);
  });

  // Verten velger brett i lobbyen
  socket.on('velgBrett', (brett) => {
    const rom = mittRom();
    if (!rom || !erVert(rom) || rom.fase !== 'lobby' || !regler.BRETT[brett]) return;
    rom.brett = brett;
    sendRom(rom);
  });

  // Verten trykker «Start spillet»
  socket.on('start', () => {
    const rom = mittRom();
    if (!rom || !erVert(rom) || rom.fase !== 'lobby') return;
    startSpill(rom);
  });

  // Spilleren som har tur, vil kaste. svar(true) hvis kastet ble godtatt.
  socket.on('kast', (svar) => {
    const rom = mittRom();
    const hendelser = rom && rom.fase === 'spill' ? regler.kast(rom.spill, mittNr(rom)) : null;
    if (typeof svar === 'function') svar(Boolean(hendelser));
    sendHendelser(rom, hendelser);
  });

  // En av de to i en duell vil kaste sin terning
  socket.on('duellKast', (svar) => {
    const rom = mittRom();
    const duell = rom && rom.fase === 'spill' ? rom.spill.duell : null;
    const side = duell ? duell.sider.indexOf(mittNr(rom)) : -1;
    const hendelser = side >= 0 ? regler.duellKast(rom.spill, side) : null;
    if (typeof svar === 'function') svar(Boolean(hendelser));
    sendHendelser(rom, hendelser);
  });

  // Emoji-reaksjoner vises hos alle i rommet
  socket.on('reaksjon', (emoji) => {
    const rom = mittRom();
    if (!rom || !REAKSJONER.includes(emoji)) return;
    io.to(rom.kode).emit('reaksjon', { emoji, spiller: mittNr(rom) });
  });

  // Etter spillet: verten velger «Spill igjen» eller «Tilbake til lobby»
  socket.on('spillIgjen', () => {
    const rom = mittRom();
    if (!rom || !erVert(rom) || rom.fase !== 'spill' || !rom.spill.ferdig) return;
    startSpill(rom);
  });

  socket.on('tilLobby', () => {
    const rom = mittRom();
    if (!rom || !erVert(rom) || rom.fase !== 'spill' || !rom.spill.ferdig) return;
    fjernBorte(rom);
    rom.fase = 'lobby';
    rom.spill = null;
    sendRom(rom);
  });

  // Bare for testene (tester- og tilgjengelighet-agentene): start serveren med TESTMODUS=1, så kan testene
  // flytte musene, velge spesialfelt og bestemme de neste terningkastene. Uten TESTMODUS finnes ikke dette.
  // Eksempel i nettleseren: socket.emit('test', { posisjoner: [5, 8], spesial: {}, kast: [3, 6, 2] })
  if (process.env.TESTMODUS === '1') {
    socket.on('test', (data) => {
      const rom = mittRom();
      if (!rom || !rom.spill || !data) return;
      const spill = rom.spill;
      if (Array.isArray(data.posisjoner)) spill.posisjoner = data.posisjoner.map(Number);
      if (data.spesial && typeof data.spesial === 'object') spill.spesial = data.spesial;
      if (Array.isArray(data.kast)) spill.testKast = data.kast.map(Number);
      if (Number.isInteger(data.tur)) spill.tur = data.tur;
      // Nytt spesialfelt-oppsett krever at brettet tegnes på nytt, så det sendes som et «nytt spill»
      if (data.spesial) {
        rom.spillNr++;
        sendRom(rom);
      } else {
        io.to(rom.kode).emit('hendelser', { hendelser: [], spill });
      }
    });
  }

  // Spilleren lukker siden (eller mister nettet)
  socket.on('disconnect', () => {
    const rom = mittRom();
    if (!rom) return;
    const nr = mittNr(rom);
    if (rom.fase === 'lobby') {
      rom.spillere.splice(nr, 1);
    } else {
      // Midt i spillet blir musen stående, men turene hoppes over
      rom.spillere[nr].tilkoblet = false;
      sendHendelser(rom, regler.spillerBorte(rom.spill, nr));
    }
    const igjen = rom.spillere.filter((s) => s.tilkoblet);
    if (!igjen.length) {
      alleRom.delete(rom.kode); // ingen igjen: rommet slettes
      return;
    }
    if (erVert(rom)) rom.vertId = igjen[0].id; // verten gikk: den neste blir vert
    sendRom(rom);
  });
});

// Lytter på alle nettverkskort, så telefoner på samme Wi-Fi også kommer inn
server.listen(PORT, () => {
  console.log(`Dice-Mice! kjører på http://localhost:${PORT}`);
  for (const adresser of Object.values(os.networkInterfaces())) {
    for (const a of adresser || []) {
      if (a.family === 'IPv4' && !a.internal) console.log(`  På samme Wi-Fi: http://${a.address}:${PORT}`);
    }
  }
});
