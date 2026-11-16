// Hook: retter formatet i filen Claude nettopp endret (kjøres etter Edit/Write).
// - Unix-linjeskift (LF) i stedet for Windows-linjeskift (CRLF)
// - ingen mellomrom eller tabulatorer på slutten av linjer
// - nøyaktig ett linjeskift til slutt i filen
// Gjelder bare tekstfiler i prosjektmappen. Hooken stopper aldri arbeidet, selv om noe går galt.

const fs = require('fs');
const path = require('path');

const ROT = path.resolve(__dirname, '..', '..');
const TEKSTFILER = new Set(['.html', '.css', '.js', '.json', '.md', '.yml', '.yaml', '.txt']);

let inndata = '';
process.stdin.on('data', (bit) => { inndata += bit; });
process.stdin.on('end', () => {
  try {
    const hendelse = JSON.parse(inndata || '{}');
    const fil = (hendelse.tool_input && hendelse.tool_input.file_path)
      || (hendelse.tool_response && hendelse.tool_response.filePath);
    if (!fil) return;

    const full = path.resolve(fil);
    const iProsjektet = full.toLowerCase().startsWith(ROT.toLowerCase() + path.sep);
    if (!iProsjektet || full.includes(path.sep + '.git' + path.sep)) return;
    if (!TEKSTFILER.has(path.extname(full).toLowerCase())) return;
    if (!fs.existsSync(full)) return;

    const foer = fs.readFileSync(full, 'utf8');
    if (foer === '') return; // tomme filer får være tomme

    const etter = foer
      .replace(/\r\n?/g, '\n')      // CRLF (og gamle Mac-linjeskift) -> LF
      .replace(/[ \t]+$/gm, '')     // mellomrom på slutten av linjer
      .replace(/\n*$/, '\n');       // nøyaktig ett linjeskift til slutt

    if (etter !== foer) {
      fs.writeFileSync(full, etter, 'utf8');
      process.stdout.write(JSON.stringify({ systemMessage: `Format rettet i ${path.relative(ROT, full)}` }));
    }
  } catch (feil) {
    // Hooken skal aldri stoppe arbeidet
  }
});
