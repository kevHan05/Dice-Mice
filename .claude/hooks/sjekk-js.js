// Hook: sjekker JavaScript-filen Claude nettopp endret for syntaksfeil (kjøres etter Edit/Write).
// - Gjelder bare .js-filer i prosjektmappen. Andre filer: gjør ingenting.
// - Kjører «node --check» på filen.
// - Er det feil: feilmeldingen skrives til stderr og hooken avslutter med kode 2,
//   så Claude får feilen tilbake med en gang og kan rette den.
// - Er det ingen feil: helt stille.
// Går noe galt i selve hooken (for eksempel ugyldig inndata), stopper den aldri arbeidet.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROT = path.resolve(__dirname, '..', '..');

let inndata = '';
process.stdin.on('data', (bit) => { inndata += bit; });
process.stdin.on('end', () => {
  let full;
  try {
    const hendelse = JSON.parse(inndata || '{}');
    const fil = (hendelse.tool_input && hendelse.tool_input.file_path)
      || (hendelse.tool_response && hendelse.tool_response.filePath);
    if (!fil) return;

    full = path.resolve(fil);
    const iProsjektet = full.toLowerCase().startsWith(ROT.toLowerCase() + path.sep);
    if (!iProsjektet || full.includes(path.sep + '.git' + path.sep)) return;
    if (path.extname(full).toLowerCase() !== '.js') return; // ikke en .js-fil: gjør ingenting
    if (!fs.existsSync(full)) return;
  } catch (feil) {
    return; // hooken skal aldri stoppe arbeidet på grunn av egne feil
  }

  // «node --check» leser filen og melder syntaksfeil uten å kjøre koden
  const sjekk = spawnSync(process.execPath, ['--check', full], { encoding: 'utf8' });
  if (sjekk.status !== 0) {
    const melding = (sjekk.stderr || sjekk.stdout || 'ukjent feil').trim();
    process.stderr.write(`JavaScript-feil i ${path.relative(ROT, full)} (node --check):\n${melding}\n`);
    process.exit(2);
  }
});
