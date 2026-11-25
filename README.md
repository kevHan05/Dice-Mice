<p align="center">
  <img src="skjermbilder/19-logo.png" alt="DICE-MICE" width="460">
</p>

**Dice-Mice!** er et brettspill i nettleseren der musene kaster terning og løper i en spiral inn mot osten i midten – den som kommer først til osten, vinner.

### ▶ [Spill her: kevhan05.github.io/Dice-Mice](https://kevhan05.github.io/Dice-Mice/)

![Spillet på PC: spiralbrettet med osten i midten, to mus, spesialfelt og en sovende katt, og sidepanelet med spillerne og terningen](skjermbilder/19-pc.png)

## Slik spiller du

1. Skriv inn navnet ditt og velg pynt på musen din. Én trykker **Opprett spill** og får en kode på fire bokstaver. De andre (opptil 4 i alt) skriver koden og trykker **Bli med**. Den som opprettet spillet, velger brett (kort, vanlig eller lang) og trykker **Start spillet**.
2. Trykk **Kast terningen** når det er din tur. Musen hopper like mange felt som terningen viser.
3. Slår du **6**, får du kaste igjen.
4. Noen felt gjør noe når du lander på dem:

   | Felt | Hva skjer |
   |---|---|
   | ⏩ Ostesmuler (grønn) | Hopp 3 felt frem |
   | ⏪ Musefelle (rød) | Gå 3 felt tilbake |
   | 🎲 Kast igjen (gul) | Du får et ekstra kast |
   | Kattefeltet (blått, med en sovende katt ved siden av) | Katten våkner og blir sur 😾 – du står over neste runde |

5. Den som først kommer til osten i midten, vinner. Du trenger ikke treffe osten nøyaktig.
6. Etter spillet står musene på en **pall** etter hvor langt de kom. Er dere fire, står den siste ved siden av og gråter. Den som opprettet spillet, velger **Spill igjen** eller **Tilbake til lobby**.

Hver spiller bruker sin egen telefon eller PC, og spillet fungerer på begge.

## Kjøre spillet lokalt

Spillet i nettleseren er vanlig HTML, CSS og JavaScript (i `public/`). En liten Node-server (`server.js`, med Express og Socket.IO) viser spillet og holder styr på spillene. Du trenger [Node.js](https://nodejs.org/):

1. Last ned eller klon repoet:
   ```bash
   git clone https://github.com/kevHan05/Dice-Mice.git
   cd Dice-Mice
   ```
2. Installer pakkene og start serveren:
   ```bash
   npm install
   npm start
   ```
3. Åpne http://localhost:3000. Serveren skriver også ut adressen telefoner på samme Wi-Fi kan bruke.

### Med Docker

Har du Docker, kan serveren kjøres i en container:

```bash
docker build -t dice-mice .
docker run --rm -p 3000:3000 dice-mice
```

Åpne så http://localhost:3000. Stopp containeren med Ctrl+C.

## Om prosjektet

Dice-Mice! er laget for å lære GitHub – issues, brancher, pull requests og merging – sammen med [Claude Code](https://claude.com/claude-code). Hver endring starter som et issue, lages på en egen branch, testes automatisk i en ekte nettleser med Playwright og samles i `test` før den går til `main`.
