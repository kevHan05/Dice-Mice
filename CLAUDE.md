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

Åpne `index.html` i rotmappen i nettleseren. Ingen installasjon trengs.

## Filer

- `index.html` – siden
- `style.css` – utseende
- `game.js` – brett, mus, ost, terning, spillogikk og lyd
- `assets/audio/tema.mp3` – bakgrunnsmusikken (SUNO-sangen)
- `.claude/skills/github-flyt/SKILL.md` – GitHub-flyten Claude følger for hver oppgave: issue → branch fra `test` (`<N>-<kort-beskrivelse>`) → endring → testing med tester-subagenten → commit (`<issue-tittel> #<N>`) → push → PR til `test` → merge i `test` → lukk issuet. `test` → `main` bare når jeg sier fra.
- `.claude/agents/tester.md` – subagenten `tester`, som tester spillet med Playwright etter hver endring og tar skjermbilder
- `.claude/test/server.js` – liten testserver (Node, ingen pakker) som viser spillet på `http://127.0.0.1:8123` for Playwright. Ikke en del av spillet.
- `.claude/settings.json` og `.claude/hooks/rett-format.js` – hooken som retter filformatet (LF, mellomrom, linjeskift til slutt) hver gang Claude endrer en fil
- `.mcp.json` – oppsett for Playwright, som Claude bruker til å teste spillet i en ekte nettleser (krever Node.js)
- `skjermbilder/` – skjermbilder fra Playwright-testene
- `.gitignore` – holder `.playwright-mcp/` (Playwright sine loggfiler) utenfor git
- `.gitattributes` – får git til å bruke LF-linjeskift i alle tekstfiler

Git: `https://github.com/kevHan05/Dice-Mice.git`. Grener: `main` (ferdig og publisert på GitHub Pages) og `test` (alle endringer samles her før `main`).

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

## Valg i prototypen (foreløpige, kan endres)

Ting jeg ikke hadde beskrevet, men som prototypen måtte ha en verdi for:

- Alle spiller på samme maskin. Antall spillere velges på startskjermen (2 er forhåndsvalgt).
- Skriver en spiller ikke inn noe navn, brukes musens fargenavn (f.eks. «Grå mus»). Maks 20 tegn.
- Tre brett (`BRETT`): Kort (30 steg, 2 omganger), Vanlig (40 steg, 2,5 omganger, forhåndsvalgt) og Lang (55 steg, 3 omganger).
- Musene har hver sin farge: grå, brun, hvit, svart.
- Man trenger ikke treffe osten nøyaktig – til eller forbi osten er seier.
- Slår man 6, kaster man igjen, hver gang. Det står «🎲 … slo 6 og kaster igjen!» under «… sin tur». Lander man på et 🎲-felt med en sekser, blir det bare ett ekstra kast. Lander man på kattefeltet med en sekser, får man først kaste igjen, og står over runden etter.
- Terningen ruller i 0,7 sekunder (`TRILLE_TID`), og hvert hopp tar 0,28 sekunder (`HOPP_TID`).
- Musene står litt og vipper mens de venter.
- Har man slått av animasjoner i operativsystemet, står musene stille og seiersfeiringen vises bare som tekst.
- Spillerlisten står over terningen, og den som har tur er markert med oransje ramme. På telefon står spillerne i en rad.
- Vinnermusen tar backflips til man går videre til pallen. Konfettien faller i ca. 10 sekunder.
- Spesialfelt (`SPESIALFELT`), omtrent hvert sjette felt, med farge og ikon:
  - ⏩ grønn – «ostesmuler»: hopp 3 felt frem.
  - ⏪ rød – «musefelle»: 3 felt tilbake.
  - 🎲 gul – kast igjen.
  - Blå uten ikon – kattefeltet: stå over neste runde. En oransje katt ligger og sover ved siden av feltet, på utsiden av spiralen og langs stien. En liten blå «z» flyter opp fra den. Lander man der, våkner katten: gule øyne, sinte øyenbryn og 💢, den rister og hveser. Etter 3 sekunder sovner den igjen (`SUR_TID`).
  - Ikke på START, første felt eller feltet rett før osten. Havner man på et nytt spesialfelt etter ⏩ eller ⏪, skjer det ingenting.
  - Hva som skjedde, står som en tekst under «… sin tur».
- Feltet musen skal til, lyser gult i et halvt sekund før den hopper (`LYS_TID`).
- Etter seieren byttes «Kast terningen» ut med «Se pallen 🏆», så man selv velger når man går videre.
- Pallen: plassering etter hvor langt musene kom. Står to likt, kommer den som kastet først foran. Navn over 12 tegn forkortes på pallen. Musen på 4. plass gråter (blå tårer).
- «Spill igjen» bruker samme spillere, pynt og brett, men spesialfeltene får nye plasser. «Tilbake til lobby» går til startskjermen med navnene og pynten fortsatt utfylt.
- Pynt (`PYNT`) velges i en liste ved siden av navnet: ingen pynt, partyhatt, krone, sløyfe eller briller.
- Emoji-reaksjoner: 👍 😂 😮 😢 🧀 🎉 under terningen. Emojien flyter opp over brettet.
- Bakgrunn: rolige «ostehull» i litt mørkere beige, og en rund lys brettplate under spiralen. Fargene er de samme som før.
- Lydeffekter lages i nettleseren (Web Audio), uten lydfiler: terningen høres ut som en ekte terning som ruller (klakk som blir glissere, og et dunk når den stopper), musen sier «boing» når den hopper, egne lyder for spesialfeltene, og en fanfare ved seier. Knappen «🔊 Lyd på/av» øverst skrur dem av og på.
- Musikken (`assets/audio/tema.mp3`) starter når man trykker «Start spillet», og går i loop. Musikk-knappen (🎵) skrur den av og på. Har man skrudd den av med knappen, starter den ikke av seg selv igjen. En volumskyver ved siden av knappen styrer hvor høyt musikken spiller (0,4 fra start). Knappen og skyveren vises bare når sangfilen finnes.

## Faser

- **Fase 1: Planlegging – ferdig.** Brainstorming, kriterier, og en prototype som kjører lokalt.
- **Fase 2: Animasjon og UI – ferdig.**
- **Fase 3: Innhold og lyd – laget, venter på sjekk.** Alt fra den gamle «Senere»-listen, unntatt å spille over nettet. Se under.
- **Fase 4: Justeringer – laget, venter på sjekk.** Se under.
- **Fase 5: Sidepanelet – laget, venter på sjekk** (issue #7). Se under.
- **Spillet til rotmappen – laget, venter på sjekk** (issue #9). Se under.
- **Fast «Kast terningen»-knapp – laget, venter på sjekk** (issue #11). Se under.
- **Skjermbilder fra Playwright – laget, venter på sjekk** (issue #13). Se under.
- **Ny arbeidsflyt (test-branch, tester-subagent, format-hook) – laget** (issue #15). Se under.
- **Playwright usynlig (headless) – laget** (issue #17). Se under.

## Fase 2: Animasjon og UI

### Animasjoner

- Musen hopper felt for felt fremover i stedet for å flytte seg rett til det nye feltet. *(Laget.)*
- Terningen ruller før den viser tallet. *(Laget.)*
- Seiersfeiring når en mus kommer til osten: vinnermusen tar backflips ved osten, og konfetti faller over brettet. *(Laget.)*
- Musene beveger seg litt mens de står i ro. *(Laget.)*

### UI

- Startskjerm før spillet begynner. *(Laget.)*
- På startskjermen velger man antall spillere (1–4). *(Laget.)*
- Hver spiller skriver inn sitt eget navn. Ved siden av navnefeltet vises musen spilleren får. *(Laget.)*
- Under spillet vises en spillerliste med hvem som er med og hvem sin tur det er. *(Laget.)*
- Siden skal fungere og se bra ut både på telefon og PC (tilpasser seg skjermstørrelsen, og trykk fungerer som klikk). *(Laget.)*

### Ikke bestemt ennå

- Stil/tema for spillet. Ikke velg en ny stil – behold dagens utseende til jeg har bestemt meg.

## Fase 3: Innhold og lyd

- Steg på brettet som gjør forskjellige ting når man lander på dem. *(Laget.)*
- Brettet: feltet musen kommer til å lande på lyser opp før den hopper. *(Laget.)*
- Brettet: tilfeldig brett, der spesialfeltene ligger på nye plasser hver runde. *(Laget.)*
- Brettet: flere brett å velge mellom (f.eks. kort og lang spiral). *(Laget.)*
- Emoji-reaksjoner spillerne kan sende til hverandre under spillet. *(Laget. Nå som alle sitter ved samme maskin, vises de bare på skjermen.)*
- Etter spillet: en pall med musene på 1., 2. og 3. plass. Er det 4 spillere, står den siste musen ved siden av pallen og gråter. *(Laget.)*
- Etter spillet: valg mellom «Spill igjen» (samme spillere) og «Tilbake til lobby». *(Laget.)*
- Dekorere musene. *(Laget.)*
- Bakgrunn. *(Laget.)*
- Musikk (SUNO). *(Laget. Sangen ligger i `assets/audio/tema.mp3`.)*
- Lydeffekter. *(Laget.)*

## Fase 4: Justeringer

- Slår man 6, får man kaste igjen. Gjelder hver gang man slår 6. *(Laget.)*
- Kattefeltet byttes ut: i stedet for 💤-ikonet ligger det en katt ved siden av feltet og sover. Lander man der, våkner katten og blir sur. Straffen er den samme som før: man står over neste runde. *(Laget.)*

## Fase 5: Sidepanelet

Sidepanelet (`<aside>` ved siden av brettet) skal bli mindre kjedelig. Behold fargene og stilen spillet har nå (beige, oransje, ost-gul). Brettet, musene og spillogikken endres ikke – bare utseendet på sidepanelet, mest i `style.css`.

- Panelet: alt ligger i et eget kort med lys bakgrunn, runde hjørner og en myk kant/skygge, så det skiller seg fra bakgrunnen med ostehull. *(Laget.)*
- Spillerlisten: hver spiller er en avrundet «pille» med musikonet i en liten sirkel i musens farge. *(Laget.)*
- Den som har tur: oransje bakgrunn, litt større, fet tekst og en liten «🎲 Din tur»-merkelapp. Når turen bytter, spretter den nye spilleren litt inn. *(Laget.)*
- Spillere som står over en runde (katten) får et lite 💤-merke og blir litt gjennomsiktige. *(Laget.)*
- Statusteksten: større og tydeligere, med en prikk i fargen til musen som har tur. *(Laget.)*
- Hendelsesteksten: en snakkeboble med farge etter hva som skjedde – grønn for ⏩, rød for ⏪, gul for 🎲, blå for katten. Den popper inn når den dukker opp. Tom boble vises ikke. *(Laget.)*
- Terningen: mer «tegneserie» – litt tykkere kant, en hard skygge rett under (som om den står på bordet) og litt runde hjørner. Den vipper litt mens den ruller. *(Laget.)*
- Knappene «Kast terningen» og «Se pallen»: «tykke» knapper med en mørkere kant i bunnen, som en 3D-knapp. De løfter seg litt ved hover og trykkes ned ved klikk. Deaktivert: grå og flat. *(Laget.)*
- Emoji-knappene: runde, blir litt større ved hover og spretter når man trykker. *(Laget.)*
- Skal se bra ut både på telefon og PC. Bare CSS-animasjoner. Med prefers-reduced-motion er sprett og vipp av. *(Laget.)*

Valg jeg (Claude) tok underveis:

- Sirkelen rundt musikonet er en lys utgave av musens farge med kant i musens farge, så musen synes. Den hvite musen får i tillegg en tynn brun kant.
- 💤-merket vises fra musen lander på kattefeltet til den har stått over runden sin.
- Teksten i snakkeboblen er fet og litt mørkere, så den er lett å lese.
- Snakkeboblen har en liten spiss som peker opp mot statusteksten. Skjer to ting samtidig (f.eks. katten og en sekser), bestemmer det første fargen.
- Når turen bytter, spretter den nye spilleren. Den spretter ikke igjen når samme spiller kaster på nytt (sekser eller 🎲).
- Hover-effektene (løft og vekst) gjelder bare på enheter med mus, så de ikke «henger igjen» på telefon.
- Når «Kast terningen» er deaktivert, er den grå, flat og står litt lavere, som om den er trykket ned.
- På telefon er pillene litt mindre og står i rader under brettet.

## Spillet til rotmappen (GitHub Pages)

Spillet flyttes fra `docs/` til rotmappen, så GitHub Pages kan publisere fra roten og musikken i `assets/` blir med. (Publiserer Pages fra `docs/`, kommer man ikke til `assets/`, og musikken mangler på nettsiden.)

- Flytt `docs/index.html`, `docs/style.css` og `docs/game.js` til rotmappen med `git mv`, og slett den tomme `docs/`-mappen. *(Laget.)*
- Endre stien til musikken i `game.js` fra `'../assets/audio/tema.mp3'` til `'assets/audio/tema.mp3'`, og oppdater kommentaren over. *(Laget.)*
- Sjekk at de andre stiene i `index.html` og `game.js` fortsatt stemmer. *(Laget. `style.css` og `game.js` ligger ved siden av `index.html`, og musikken er den eneste lydfilen – de andre lydene lages i nettleseren.)*
- Oppdater stiene i denne filen og i `.claude/skills/github-flyt/SKILL.md`. *(Laget.)*
- Etter merge: sett GitHub Pages til å publisere fra roten (Settings → Pages → Branch `main`, mappe `/ (root)`).

## Fast «Kast terningen»-knapp

«Kast terningen»-knappen flyttet seg når snakkeboblen dukket opp eller forsvant (opptil ca. 100 px), så den var vanskelig å treffe.

- Snakkeboblen får en fast plass i sidepanelet (112 px høy), så terningen, knappen og emoji-knappene under står stille – med og uten boble, og også med de lengste tekstene (katten + sekser). *(Laget. Målt: knappen står på samme sted på PC, telefon og smal telefon på 320 px.)*
- Boblen ser ut som før (farger, spiss, popp-inn). Når den er tom, er plassen tom. *(Laget.)*

## Skjermbilder fra Playwright

Playwright (via `.mcp.json`) brukes til å teste spillet i en ekte nettleser. Skjermbildene fra testene skal ligge i en egen mappe i prosjektet, så man kan se hvordan spillet så ut.

- Lag mappen `skjermbilder/` og flytt skjermbildet fra Playwright-testen dit (`etter-5-kast.png`: 2 spillere etter 5 kast). *(Laget.)*
- Lag `.gitignore` som holder `.playwright-mcp/` (Playwright sine loggfiler og midlertidige filer) utenfor git. *(Laget.)*
- Ta med `.mcp.json`, så Playwright virker for prosjektet. *(Laget.)*
- Playwright åpner ikke filer direkte (`file:`), så under testing startes en midlertidig webserver for prosjektmappen (Node, ingen pakker). Den er ikke en del av spillet.

## Ny arbeidsflyt: test-branch, tester-subagent og format-hook

Alle endringer skal gå til en egen `test`-branch før de kommer til `main`.

- Jeg forklarer en oppgave. Claude lager issuet på GitHub og gjør alt derfra til endringen er merget i `test`: branch fra `test`, endringen, testing, commit, push, PR til `test`, merge og lukking av issuet.
- `Closes #N` lukker bare issuet når en PR merges til `main`. Derfor lukker Claude issuet selv når PR-en er merget i `test`, med en kommentar om hvilken PR som løste det.
- Endringer går fra `test` til `main` bare når jeg sier fra. Da lager Claude en PR fra `test` til `main`, viser hva som er med, og merger etter at jeg har sagt OK.
- Testingen gjøres av en egen subagent, `tester`, som bruker Playwright: den åpner spillet i en ekte nettleser, klikker seg gjennom, sjekker at det ikke er feil og tar skjermbilder til `skjermbilder/`.
- En hook retter filformatet hver gang Claude endrer en fil: Unix-linjeskift (LF), ingen mellomrom på slutten av linjer, og nøyaktig ett linjeskift til slutt i filen. Bare tekstfiler (HTML, CSS, JS, JSON, Markdown osv.), ikke lyd og bilder.
- `.gitattributes` får git til å bruke LF, så advarslene «LF will be replaced by CRLF» forsvinner.
- Regel 2 endres: Claude kan gjøre alt selv frem til merge i `test`, og viser oppsummering og diff etterpå. Jeg må si OK før noe går fra `test` til `main`.

*(Laget: `test`-branchen, ny `SKILL.md`, subagenten `tester`, testserveren, hooken, `.gitattributes` og ny regel 2. Hooken er testet på en fil med CRLF og mellomrom på slutten. Tester-subagenten er prøvekjørt med Playwright: BESTÅTT, skjermbilder i `skjermbilder/15-pc.png` og `skjermbilder/15-telefon.png`. Første gang alle filene ble gjort om til LF, fikk `game.js` og `.mcp.json` et manglende linjeskift helt til slutt – ellers er koden uendret.)*

## Playwright usynlig (headless)

Playwright-nettleseren vistes på skjermen mens tester-subagenten testet, og klikk i vinduet kunne forstyrre testen.

- Playwright startes med `--headless` i `.mcp.json`, så nettleseren kjører usynlig. Skjermbildene havner i `skjermbilder/` som før. *(Laget. Spillet er testet med tester-subagenten: BESTÅTT, `skjermbilder/17-pc.png` og `17-telefon.png`. Selve usynligheten sjekkes etter neste omstart av Claude Code: da skal `navigator.userAgent` inneholde «HeadlessChrome».)*
- Endringen i `.mcp.json` virker først når Claude Code startes på nytt (da startes Playwright på nytt med den nye innstillingen).

## Senere (ikke lag før jeg ber om det)

- Spille over nettet: hver spiller på sin egen enhet, telefon og PC sammen. Hvordan dette skal løses teknisk, er ikke bestemt ennå.
