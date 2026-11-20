# Dice-Mice!

Et terningspill over nettet som spilles med venner. Brettspill der mus kaster terning og løper i en spiral mot osten i midten.

## Regler for Claude (gjelder alltid)

1. Følg reglene i denne filen.
2. Alle endringer går til `test`-branchen først (følg github-flyt-skillen). Frem til merge i `test` gjør du alt selv, og viser meg oppsummering og diff etterpå. Før noe går fra `test` til `main`, skal du vise meg hva som er med og vente på at jeg sier OK.
3. Ikke legg til funksjoner, filer eller avhengigheter jeg ikke har beskrevet. Spør heller først.
4. Bruk bare vanlig HTML, CSS og JavaScript. Ingen rammeverk, biblioteker eller byggeverktøy.
5. All informasjon om spillet og kriteriene skal stå i denne filen. Oppdater den når spillet endres.
6. Skriv kode og kommentarer på norsk, slik resten av koden er (f.eks. `posisjoner`, `kastTerning`).
7. Når vi planlegger noe nytt, skriv det inn i denne filen med en gang – før det lages.

## Kjøre spillet

Åpne `index.html` i rotmappen i nettleseren. Ingen installasjon trengs. På nettet: https://kevhan05.github.io/Dice-Mice/

## Filer

- `index.html` – siden (med DICE-MICE-logoen)
- `style.css` – utseende
- `game.js` – brett, mus, ost, terning, spillogikk og lyd
- `favicon.svg` – fane-ikonet (osten)
- `assets/audio/tema.mp3` – bakgrunnsmusikken (SUNO-sangen)
- `README.md` – presentasjonen av spillet på GitHub
- `skjermbilder/` – skjermbilder fra Playwright-testene
- `.github/ISSUE_TEMPLATE/oppgave.md` og `feil.md` – maler for nye issues på GitHub (oppgave og feil)
- `.github/pull_request_template.md` – mal for nye PR-er på GitHub
- `.claude/skills/github-flyt/SKILL.md` – GitHub-flyten Claude følger for hver oppgave
- `.claude/agents/tester.md` – subagenten `tester`, som tester spillet med Playwright og tar skjermbilder
- `.claude/agents/tilgjengelighet.md` – subagenten `tilgjengelighet`, som sjekker tastatur, skjermleser, kontrast, knappestørrelse på telefon og redusert bevegelse med Playwright (bare når jeg ber om det)
- `.claude/test/server.js` – liten testserver (Node, ingen pakker) som viser spillet på `http://127.0.0.1:8123` for Playwright. Ikke en del av spillet.
- `.claude/settings.json` – sier hvilke hooker som kjøres når Claude endrer en fil
- `.claude/hooks/rett-format.js` – hooken som retter filformatet hver gang Claude endrer en fil
- `.claude/hooks/sjekk-js.js` – hooken som sjekker .js-filer for syntaksfeil (`node --check`) hver gang Claude endrer en
- `.mcp.json` – oppsett for Playwright (krever Node.js), som kjører usynlig (`--headless`)
- `.gitignore` – holder `.playwright-mcp/` (Playwright sine loggfiler) utenfor git
- `.gitattributes` – får git til å bruke LF-linjeskift i alle tekstfiler

## Git og arbeidsflyt

Git: `https://github.com/kevHan05/Dice-Mice.git`. Grener:
- `main` – ferdig og publisert. GitHub Pages publiserer fra roten av `main` (Settings → Pages → Branch `main`, mappe `/ (root)`).
- `test` – alle endringer samles her før `main`.

Slik jobber vi (detaljene står i `.claude/skills/github-flyt/SKILL.md`):

- Jeg forklarer en oppgave. Claude lager issuet på GitHub og gjør alt derfra til endringen er merget i `test`: branch fra `test` (`<N>-<kort-beskrivelse>`), endringen, testing, commit (`<issue-tittel> #<N>`), push, PR til `test`, merge og lukking av issuet.
- `Closes #N` lukker bare issuet når en PR merges til `main`. Derfor lukker Claude issuet selv når PR-en er merget i `test`, med en kommentar om hvilken PR som løste det.
- Endringer går fra `test` til `main` bare når jeg sier fra. Da lager Claude en PR fra `test` til `main`, viser hva som er med, og merger etter at jeg har sagt OK.
- Testingen gjøres av subagenten `tester` med Playwright: den åpner spillet i en ekte nettleser, klikker seg gjennom, sjekker at det ikke er feil og tar skjermbilder til `skjermbilder/`. Den kjøres bare når noe i selve spillet kan være påvirket (`index.html`, `style.css`, `game.js`, `favicon.svg`, `assets/`) eller testoppsettet endres. Ellers sjekker Claude selv det som er endret.
- Issues og PR-er følger malene i `.github/` – både de Claude lager og de som lages for hånd på GitHub.
- `tester` gjør alltid en kort tilgjengelighetssjekk av det som er endret. Bare nye problemer gjør testen FEILET; kjente problemer står i «Kjente tilgjengelighetsproblemer».
- Den fulle sjekken, subagenten `tilgjengelighet`, kjøres bare når jeg ber om det eller når oppgaven handler om tilgjengelighet, ikke på hver PR. Den rapporterer med det viktigste først og endrer ikke kode; det jeg vil rette, blir egne oppgaver.
- En hook retter filformatet hver gang Claude endrer en fil: Unix-linjeskift (LF), ingen mellomrom på slutten av linjer, og nøyaktig ett linjeskift til slutt. Bare tekstfiler, ikke lyd og bilder.
- En hook sjekker JavaScript hver gang Claude endrer en .js-fil: den kjører `node --check`, og er det en syntaksfeil, får Claude feilmeldingen tilbake med en gang (exit-kode 2) og retter den. Uten feil, og for andre filer, er den stille. Den står etter rett-format-hooken i `settings.json` (Claude Code kjører dem samtidig, men det spiller ingen rolle, fordi formatrettingen ikke endrer om koden er gyldig).

## Spillet

- Hver spiller er en mus som starter på «START»-plassen.
- Spillerne bytter på å kaste en terning og flytter musen like mange steg som terningen viser.
- Den som først kommer til osten i midten, vinner.
- Spillet skal kunne spilles sammen på tvers av telefon og PC, der hver spiller bruker sin egen enhet.

### Brettet

- Sirkulært brett der stegene går i en spiral inn mot midten.

### Musene

- Enkel tegning av en mus med ører og hale.

### Osten

- Et ostestykke skåret ut som et kakestykke fra en stor rund ost.

### Ikke bestemt ennå

- Stil/tema: dagens stil er valgt og skal beholdes – blå bakgrunn med ostehull (blå siden issue #38, før beige), oransje og ost-gult, og tegneseriepreg (tykke kanter, runde former). Nye ting skal passe inn i den.

## Valg i prototypen (foreløpige, kan endres)

Ting jeg ikke hadde beskrevet, men som prototypen måtte ha en verdi for.

### Spillere og start

- Alle spiller på samme maskin. Antall spillere (1–4) velges på startskjermen (2 er forhåndsvalgt).
- Skriver en spiller ikke inn noe navn, brukes musens fargenavn (f.eks. «Grå mus»). Maks 20 tegn.
- Musene har hver sin farge: grå, brun, hvit, svart. Ved siden av navnefeltet vises musen spilleren får.
- Pynt (`PYNT`) velges i en liste ved siden av navnet: ingen pynt, partyhatt, krone, sløyfe eller briller.
- Tre brett (`BRETT`): Kort (30 steg, 2 omganger), Vanlig (40 steg, 2,5 omganger, forhåndsvalgt) og Lang (55 steg, 3 omganger).

### Terning og bevegelse

- Man trenger ikke treffe osten nøyaktig – til eller forbi osten er seier.
- Slår man 6, kaster man igjen, hver gang. Det står «🎲 … slo 6 og kaster igjen!» under «… sin tur». Lander man på et 🎲-felt med en sekser, blir det bare ett ekstra kast. Lander man på kattefeltet med en sekser, får man først kaste igjen, og står over runden etter.
- Terningen ruller i 0,7 sekunder (`TRILLE_TID`), og hvert hopp tar 0,28 sekunder (`HOPP_TID`). Musen hopper felt for felt.
- Feltet musen skal til, lyser gult i et halvt sekund før den hopper (`LYS_TID`).
- Musene står litt og vipper mens de venter.

### Spesialfelt

- Spesialfelt (`SPESIALFELT`), omtrent hvert sjette felt, med farge og ikon. De får nye, tilfeldige plasser hver runde:
  - ⏩ grønn – «ostesmuler»: hopp 3 felt frem.
  - ⏪ rød – «musefelle»: 3 felt tilbake.
  - 🎲 gul – kast igjen.
  - Blå uten ikon – kattefeltet: stå over neste runde. En oransje katt ligger og sover ved siden av feltet, på utsiden av spiralen og langs stien. En liten blå «z» flyter opp fra den. Lander man der, våkner katten: gule øyne, sinte øyenbryn og 💢, den rister og hveser. Etter 3 sekunder sovner den igjen (`SUR_TID`).
  - Ikke på START, første felt eller feltet rett før osten. Havner man på et nytt spesialfelt etter ⏩ eller ⏪, skjer det ingenting.
  - Hva som skjedde, står i en snakkeboble under «… sin tur».

### Seier og etter spillet

- Vinnermusen tar backflips ved osten, og konfetti faller over brettet i ca. 10 sekunder. Har man slått av animasjoner i operativsystemet, vises bare seiersteksten.
- Etter seieren byttes «Kast terningen» ut med «Se pallen 🏆», så man selv velger når man går videre.
- Pallen: plassering etter hvor langt musene kom. Står to likt, kommer den som kastet først foran. Navn over 12 tegn forkortes på pallen. Er det 4 spillere, står musen på 4. plass ved siden av pallen og gråter (blå tårer).
- «Spill igjen» bruker samme spillere, pynt og brett, men spesialfeltene får nye plasser. «Tilbake til lobby» går til startskjermen med navnene og pynten fortsatt utfylt.

### Sidepanelet

- Panelet ved siden av brettet er et eget kort med lys bakgrunn, runde hjørner og myk skygge.
- Spillerlisten står øverst i panelet. Hver spiller er en avrundet «pille» med musikonet i en sirkel i en lys utgave av musens farge, med kant i musens farge (den hvite musen får i tillegg en tynn brun kant). På telefon er pillene litt mindre og står i rader under brettet.
- Den som har tur: oransje pille, litt større, fet tekst og «🎲 Din tur»-merkelapp. Når turen bytter, spretter den nye spilleren litt inn – men ikke når samme spiller kaster på nytt (sekser eller 🎲).
- Spillere som står over en runde får et 💤-merke og blir litt gjennomsiktige, fra de lander på kattefeltet til de har stått over.
- Statusteksten er stor og tydelig, med en prikk i fargen til musen som har tur.
- Snakkeboblen har farge etter hva som skjedde (grønn ⏩, rød ⏪, gul 🎲, blå katt), fet og litt mørkere tekst, og en liten spiss som peker opp mot statusteksten. Den popper inn. Skjer to ting samtidig (f.eks. katten og en sekser), bestemmer det første fargen.
- Snakkeboblen har en fast plass (112 px høy), så terningen, «Kast terningen» og emoji-knappene står stille med og uten boble. Når den er tom, er plassen tom.
- Terningen er i «tegneserie»-stil: tykk kant, hard skygge rett under og runde hjørner. Den vipper mens den ruller.
- «Kast terningen» og «Se pallen» er tykke 3D-knapper med mørkere kant i bunnen. De løfter seg ved hover og trykkes ned ved klikk. Deaktivert er de grå, flate og står litt lavere.
- Emoji-reaksjoner: 👍 😂 😮 😢 🧀 🎉 som runde knapper under terningen. De blir større ved hover og spretter når man trykker, og emojien flyter opp over brettet. Nå som alle sitter ved samme maskin, vises de bare på skjermen.
- Hover-effektene gjelder bare på enheter med mus, så de ikke «henger igjen» på telefon. Med prefers-reduced-motion er sprett og vipp av.

### Logo, ikon og utseende

- Logo øverst: «DICE-MICE» som SVG rett i `index.html`. DICE er ost-gul med ostehull (et mønster som fyller bokstavene, så hullene alltid er inni dem) og brun osteaktig kant. MICE er grå med svak overgang (lysere øverst), museører på M og en rosa musehale på E. Bindestreken er brun.
- Logoen bruker Arial Black (med reserveskrifter). Bredden på hvert ord er låst, så ørene og halen havner riktig også med en annen skrift. Den er maks 460 px bred, vises på alle skjermene og leses som «Dice-Mice!» av skjermlesere.
- Fane-ikonet `favicon.svg` er osten fra brettet, med litt tykkere kant så den synes i den lille fanen.
- Bakgrunn: lys himmelblå (#cfe3f5) med rolige «ostehull» i litt mørkere blått (issue #38). Brettplaten under spiralen, sidepanelet og startskjermen er fortsatt lyse, så alt står godt frem mot det blå.
- Siden tilpasser seg både telefon og PC, og trykk fungerer som klikk.

### Lyd og musikk

- Lydeffekter lages i nettleseren (Web Audio), uten lydfiler: terningen høres ut som en ekte terning som ruller (klakk som blir glissere, og et dunk når den stopper), musen sier «boing» når den hopper, egne lyder for spesialfeltene (katten hveser), og en fanfare ved seier. Knappen «🔊 Lyd på/av» øverst skrur dem av og på.
- Musikken (`assets/audio/tema.mp3`) starter når man trykker «Start spillet», og går i loop. Musikk-knappen (🎵) skrur den av og på. Har man skrudd den av med knappen, starter den ikke av seg selv igjen. En volumskyver ved siden av knappen styrer hvor høyt musikken spiller (0,4 fra start). Knappen og skyveren vises bare når sangfilen finnes.

### Testing og verktøy

- Playwright åpner ikke filer direkte (`file:`), så testene bruker testserveren i `.claude/test/server.js`. Den stopper av seg selv etter 5 minutter uten besøk.
- Playwright kjører usynlig (headless). Usynlig Chrome henter ikke fane-ikonet selv, så testeren sjekker `favicon.svg` med `fetch`. Knappens plass måles med `offsetTop`, fordi `getBoundingClientRect()` tar med løft- og trykk-animasjonen.
- Skjermbildene fra testene heter `skjermbilder/<issue-nummer>-<navn>.png`.

### Tilgjengelighet

- Oransje knapper og «Din tur»-pillen har mørkebrun tekst (#3d2b08, ca. 6 : 1) i stedet for hvit. «🎲 Din tur»-merkelappen er mørkere brun (#7a5208). Deaktivert knapp har tekst #4a4a4a.
- Tydelig fokusramme for tastatur (`:focus-visible`): 3 px mørkebrun ramme litt utenfor kanten.
- «Kast terningen» bruker `aria-disabled` (ikke `disabled`) mens terningen ruller, så den beholder fokus. Fokus flyttes med vilje når skjermen bytter: til «Kast terningen» når spillet starter, til «Se pallen 🏆» ved seier, til overskriften «Resultat» på pallen, og til det valgte antallet spillere i lobbyen.
- Skjermleser: statusteksten har `aria-live`, en usynlig tekst sier «<navn> slo <tall>.» etter hvert kast, brettet sier hvor musene står («Spillbrettet: Grå mus på felt 7 av 40, …»), spillerlisten har usynlig «(har tur)» og «(står over neste runde)», og antall-/brett-knappene er grupper med navn og `aria-pressed`.
- Telefon: knapper og felt er minst 44 px høye, og på smal skjerm står terningen og «Kast terningen» side om side rett under statusteksten, med snakkeboblen under (uten spiss), så knappen synes uten å scrolle. Litt mer luft mellom emoji-knappene.
- Redusert bevegelse: musene glir uten bue, og terningen blinker ikke mens den ruller.

### Kjente tilgjengelighetsproblemer

`tester` regner disse ikke som nye feil. Når et problem er rettet, fjernes det herfra.

- Ingen kjente akkurat nå. Problemene fra issue #30 er rettet i issue #35.

## Ferdig

- **Fase 1: Planlegging** – brainstorming, kriterier og en prototype som kjører lokalt.
- **Fase 2: Animasjon og UI** – startskjerm, navn, spillerliste, hopping, terningrulling, seiersfeiring, telefon og PC.
- **Fase 3: Innhold og lyd** – spesialfelt, tilfeldig brett, tre brett, emoji-reaksjoner, pall, «Spill igjen»/«Tilbake til lobby», pynt, bakgrunn, musikk og lydeffekter.
- **Fase 4: Justeringer** – sekser gir nytt kast, og kattefeltet med en sovende katt.
- **Fase 5: Sidepanelet** (issue #7) – kort, piller, snakkeboble, tegneserieterning og 3D-knapper.
- **Spillet til rotmappen** (issue #9) – så GitHub Pages publiserer fra roten og musikken blir med.
- **Fast «Kast terningen»-knapp** (issue #11) – snakkeboblen har fast plass.
- **Skjermbilder fra Playwright** (issue #13) – mappen `skjermbilder/`, `.gitignore` og `.mcp.json`.
- **Ny arbeidsflyt** (issue #15) – `test`-branch, tester-subagent, format-hook og `.gitattributes`.
- **Playwright usynlig** (issue #17).
- **Fane-ikon og DICE-MICE-logo** (issue #19).
- **README.md** (issue #22).
- **Oppdatert tester-agent** (issue #23).
- **Ryddet CLAUDE.md** (issue #24) – ferdige seksjoner samlet her, detaljene flyttet til «Valg i prototypen».
- **Kort tilgjengelighetssjekk i tester-agenten** (issue #34) – `tester` sjekker tilgjengeligheten til det som er endret. Bare nye problemer gjør testen FEILET.
- **Hook som sjekker JavaScript** (issue #31) – `sjekk-js.js` fanger syntaksfeil i .js-filer med en gang.
- **Subagent for tilgjengelighet** (issue #30) – `tilgjengelighet` sjekker tastatur, skjermleser, kontrast, knappestørrelse og redusert bevegelse. Kjøres bare når jeg ber om det. Første rapport: `skjermbilder/30-*.png`.
- **Blå bakgrunn** (issue #38) – lys himmelblå med ostehull i blått. Testet: BESTÅTT, `skjermbilder/38-*.png`.
- **Rettet tilgjengelighetsproblemene fra #30** (issue #35) – fokus, kontrast, skjermleser, fokusramme, `aria-pressed`, 44 px og plassering på telefon, redusert bevegelse. Etter mitt ønske ble `tester` og `tilgjengelighet` hoppet over; Claude sjekket selv med usynlig Chrome (ingen feil, fokus og opplesning virker). Kjør gjerne `tilgjengelighet` senere for å bekrefte.
- **Maler for issues og PR-er** (issue #26) – `oppgave.md`, `feil.md` og `pull_request_template.md` i `.github/`. github-flyt-skillen bruker de samme malene, og tester-subagenten kjøres bare når spillet kan være påvirket. Malene vises på GitHub når de ligger i `main`.

## Pågår og planlagt

- Ingenting akkurat nå.

## Senere (ikke lag før jeg ber om det)

- Spille over nettet: hver spiller på sin egen enhet, telefon og PC sammen. Hvordan dette skal løses teknisk, er ikke bestemt ennå.
