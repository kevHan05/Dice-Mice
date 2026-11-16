// Liten testserver for Playwright-testene (Playwright åpner ikke filer direkte med file:).
// Viser prosjektmappen på http://127.0.0.1:8123. Bare lesing, bare fra denne maskinen.
// Brukes av tester-subagenten (.claude/agents/tester.md). Den er ikke en del av spillet.
// Stopper av seg selv etter 5 minutter uten besøk, så den aldri blir hengende igjen.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROT = path.resolve(__dirname, '..', '..');
const PORT = 8123;
const STOPP_ETTER_MS = 5 * 60 * 1000;
const TYPER = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

let stoppTimer = setTimeout(() => process.exit(0), STOPP_ETTER_MS);

const server = http.createServer((req, res) => {
  clearTimeout(stoppTimer);
  stoppTimer = setTimeout(() => process.exit(0), STOPP_ETTER_MS);

  const sti = decodeURIComponent(req.url.split('?')[0]);
  const fil = path.join(ROT, sti === '/' ? 'index.html' : sti);
  if (!fil.startsWith(ROT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(fil, (feil, data) => {
    if (feil) { res.writeHead(404); res.end('Ikke funnet'); return; }
    res.writeHead(200, { 'Content-Type': TYPER[path.extname(fil).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
});

// Kjører serveren allerede (porten er i bruk), avslutter denne kopien stille
server.on('error', (feil) => {
  if (feil.code === 'EADDRINUSE') process.exit(0);
  throw feil;
});

server.listen(PORT, '127.0.0.1', () => console.log(`Testserver på http://127.0.0.1:${PORT}`));
