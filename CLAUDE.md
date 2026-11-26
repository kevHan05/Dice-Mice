# Dice-Mice!

Et terningspill over nettet som spilles med venner. Brettspill der mus kaster terning og løper i en spiral mot osten i midten.

## Regler for Claude (gjelder alltid)

1. Følg reglene i denne filen.
2. Jeg skriver et issue på GitHub og ber deg lese det. Du gjør alt imellom selv (følg github-flyt-skillen): endringen, testing, PR til `test` og merge i `test`, og så en PR fra `test` til `main`. Deretter viser du meg oppsummering og diff. Det eneste jeg gjør, er å merge PR-en fra `test` til `main` på GitHub – du merger aldri til `main` selv.
3. Ikke legg til funksjoner, filer eller avhengigheter jeg ikke har beskrevet. Spør heller først.
4. Bruk bare vanlig HTML, CSS og JavaScript. Ingen rammeverk, biblioteker eller byggeverktøy. Ett unntak: flerspiller-serveren (`server.js`) bruker Express og Socket.IO, se «Flerspiller over nettet» under «Pågår og planlagt». Selve spillet i nettleseren er fortsatt bare vanlig HTML, CSS og JavaScript.
5. All informasjon om spillet og kriteriene skal stå i denne filen. Oppdater den når spillet endres.
6. Skriv kode og kommentarer på norsk, slik resten av koden er (f.eks. `posisjoner`, `kastTerning`).
7. Når vi planlegger noe nytt, skriv det inn i denne filen med en gang – før det lages.

## Kjøre spillet

Fra issue #56 trenger spillet serveren: `npm install` (første gang) og `npm start`, og åpne http://localhost:3000. Serveren skriver også ut adressen telefoner på samme Wi-Fi kan bruke (f.eks. `http://10.0.0.4:3000`). Krever Node.js. Å åpne `public/index.html` direkte virker ikke lenger.

På nettet: https://dice-mice.onrender.com (Render, gratisnivået, valgt fordi dette er for læring). Render bygger fra `Dockerfile` og setter `PORT` selv (`server.js` bruker `process.env.PORT`). Serveren sovner etter ca. 15 minutter uten besøk, og første besøk etterpå tar under et minutt. Rommene ligger bare i minnet, så de forsvinner når serveren sovner eller startes på nytt. Jeg har laget kontoen og koblet GitHub selv.

Den gamle Pages-adressen (https://kevhan05.github.io/Dice-Mice/, med eget domene `dice-mice.d.prodio.no` i `CNAME`) viser bare `index.html` i roten, som sender besøkende videre til Render.

Med Docker (issue #52, byttet til Node i issue #56): `docker build -t dice-mice .` og `docker run --rm -p 3000:3000 dice-mice`, og åpne http://localhost:3000. Containeren er `node:22-alpine` med bare `package.json`, `package-lock.json`, `server.js`, `spillregler.js` og `public/`, og kjører som brukeren `node`. Legges det til nye filer som serveren trenger, må de også legges til i `Dockerfile`. (Adressen «På samme Wi-Fi» som serveren skriver ut i containeren, er containerens egen og virker ikke fra telefonen; bruk PC-ens adresse.)

## Filer

- `server.js` – flerspiller-serveren (Express og Socket.IO): viser `public/`, holder styr på rommene og sender hendelsene til alle i rommet
- `spillregler.js` – spillreglene (tur, terning, spesialfelt, duell, seier). Brukes bare av serveren, og kan ikke lastes ned fra nettleseren.
- `package.json` og `package-lock.json` – pakkene serveren trenger (`express`, `socket.io`) og `npm start`. `node_modules/` er ikke i git.
- `public/index.html` – siden (med DICE-MICE-logoen, startskjermen og lobbyen)
- `public/style.css` – utseende
- `public/game.js` – brett, mus, ost, terning, animasjon, lyd og knapper. Spiller av hendelsene fra serveren.
- `public/favicon.svg` – fane-ikonet (osten)
- `public/assets/audio/tema.mp3` – bakgrunnsmusikken (SUNO-sangen)
- `README.md` – presentasjonen av spillet på GitHub
- `skjermbilder/` – skjermbilder fra Playwright-testene
- `.github/ISSUE_TEMPLATE/oppgave.md` og `feil.md` – maler for nye issues på GitHub (oppgave og feil)
- `.github/pull_request_template.md` – mal for nye PR-er på GitHub
- `.claude/skills/github-flyt/SKILL.md` – GitHub-flyten Claude følger for hver oppgave
- `.claude/agents/tester.md` – subagenten `tester`, som tester spillet med Playwright og tar skjermbilder
- `.claude/agents/tilgjengelighet.md` – subagenten `tilgjengelighet`, som sjekker tastatur, skjermleser, kontrast, knappestørrelse på telefon og redusert bevegelse med Playwright (bare når jeg ber om det)
- `.claude/settings.json` – sier hvilke hooker som kjøres når Claude endrer en fil
- `.claude/hooks/rett-format.js` – hooken som retter filformatet hver gang Claude endrer en fil
- `.claude/hooks/sjekk-js.js` – hooken som sjekker .js-filer for syntaksfeil (`node --check`) hver gang Claude endrer en
- `.mcp.json` – oppsett for Playwright (krever Node.js), som kjører synlig (uten `--headless`), så jeg kan se testene, og bruker Microsoft Edge (`--browser msedge`), fordi Chrome ikke er installert
- `.gitignore` – holder `.playwright-mcp/` (Playwright sine loggfiler) og `node_modules/` utenfor git
- `.gitattributes` – får git til å bruke LF-linjeskift i alle tekstfiler
- `Dockerfile` – kjører serveren i en container med Node (se «Kjøre spillet»)
- `index.html` (i roten) – videresending fra GitHub Pages til spillet på Render. Ikke en del av spillet.
- `CNAME` – det egne domenet til GitHub Pages (`dice-mice.d.prodio.no`)

## Git og arbeidsflyt

Git: `https://github.com/kevHan05/Dice-Mice.git`. Grener:
- `main` – ferdig og publisert. Render bygger spillet fra `main`. GitHub Pages publiserer fra roten av `main` (Settings → Pages → Branch `main`, mappe `/ (root)`), der det bare ligger videresendingen til Render.
- `test` – alle endringer samles her før `main`.

Slik jobber vi (detaljene står i `.claude/skills/github-flyt/SKILL.md`):

- Jeg skriver et issue på GitHub og sier «les issue #N». (Forklarer jeg en oppgave bare i chatten, lager Claude issuet selv.)
- Claude gjør alt imellom: gjør `test` lik `main`, branch fra `test` (`<N>-<kort-beskrivelse>`), endringen, testing, commit (`<issue-tittel> #<N>`), push, PR til `test` og merge i `test`. Så lager (eller oppdaterer) Claude én PR fra `test` til `main` med alle issuene som er med.
- Jeg merger PR-en fra `test` til `main` på GitHub. Den har én `Closes #N`-linje per issue, så issuene lukkes av seg selv da. Et åpent issue betyr altså «ikke ute på nettsiden ennå». (`Closes #N` virker bare ved merge til `main`, ikke til `test`.)
- Testingen gjøres av subagenten `tester` med Playwright: den åpner spillet i en ekte nettleser, klikker seg gjennom, sjekker at det ikke er feil og tar skjermbilder til `skjermbilder/`. Den kjøres bare når noe i selve spillet kan være påvirket (`public/`, `server.js`, `spillregler.js`) eller testoppsettet endres. Ellers sjekker Claude selv det som er endret.
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

- Stil/tema: dagens stil er valgt og skal beholdes – beige bakgrunn med ostehull (blå i issue #38, tilbake til beige i issue #44), oransje og ost-gult, og tegneseriepreg (tykke kanter, runde former). Nye ting skal passe inn i den.

## Valg i prototypen (foreløpige, kan endres)

Ting jeg ikke hadde beskrevet, men som prototypen måtte ha en verdi for.

### Spillere og start

- Hver spiller er på sin egen enhet (issue #56). Startskjermen har navn og pynt, «Opprett spill», og et kodefelt med «Bli med». Skrives koden feil, eller er spillet fullt eller allerede startet, står det en feilmelding under (leses opp av skjermleser).
- «Opprett spill» lager et rom med en kode på 4 bokstaver (uten I og O, så de ikke forveksles med 1 og 0). Den som oppretter, er verten.
- Lobbyen viser romkoden stort, spillerne (med «(deg)» og «👑 Vert»), brettvalget og «Start spillet». Bare verten kan velge brett og starte; de andre ser brettet verten har valgt (knappene er deaktivert) og «Venter på at verten starter spillet …».
- 1–4 spillere: så mange som er i rommet når verten starter. Man kan ikke bli med i et spill som har startet.
- Skriver en spiller ikke inn noe navn, brukes musens fargenavn (f.eks. «Grå mus»). Maks 20 tegn.
- Musene har hver sin farge: grå, brun, hvit, svart. Man får den første ledige fargen i rommet. På startskjermen vises den grå musen med pynten, fordi fargen ikke er kjent før man er i rommet.
- Pynt (`PYNT`) velges i en liste ved siden av navnet: ingen pynt, partyhatt, krone, sløyfe eller briller.
- Tre brett (`BRETT` i `spillregler.js`): Kort (30 steg, 2 omganger), Vanlig (40 steg, 2,5 omganger, forhåndsvalgt) og Lang (55 steg, 3 omganger).
- Lukker en spiller siden i lobbyen, forsvinner den fra rommet. Midt i spillet blir musen stående med «(har gått)» og blir litt gjennomsiktig, og turene til den hoppes over. Er den med i en duell, kaster serveren for den. Går verten, blir den neste spilleren vert. Når alle har gått, slettes rommet. Man kan ikke komme tilbake til samme spill etter å ha lastet siden på nytt.
- Mister nettleseren forbindelsen til serveren, går den tilbake til startskjermen med meldingen «Forbindelsen til serveren ble brutt …».

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

### Museduell (issue #51)

- Ender musen som har tur på et vanlig felt der en annen mus står, blir det duell. Ikke på START, spesialfelt eller osten.
- Duellen gjelder også når musen havner på feltet etter ⏩ eller ⏪.
- Står flere mus der, duellerer man mot den som kom dit sist (`ankomst`).
- En boks «⚔️ Duell!» vises over brettet med to terninger, i fargen til hver mus og med navnet under. Den ligger på motsatt halvdel fra duellfeltet (nederst hvis feltet er i øvre halvdel, ellers øverst), så den ikke dekker musene. Etter likt blir terningene tomme igjen.
- Hver spiller kaster sin egen terning med sin egen «Kast»-knapp under terningen, på sin egen enhet (i hvilken som helst rekkefølge). Duellboksen vises hos alle, men bare ens egen knapp kan trykkes; de andre er deaktivert. Fokus går til ens egen knapp. Ved likt står det «Likt – kast igjen!», og begge må kaste på nytt. Etter duellen går fokus tilbake til «Kast terningen».
- Under duellen stiller de to musene seg side om side på feltet og ser på hverandre. Den som har tur står til venstre, og motstanderen står til høyre, speilvendt. De rører ikke hverandre: det er ca. 10 i luft mellom nesene (`DUELL_AVSTAND` = 30).
- Høyest går 2 felt frem, lavest 2 felt tilbake (`DUELL_STEG`), med hopp, vinneren først. Kommer vinneren til osten, vinner den spillet – også om det ikke var vinnerens tur.
- Havner vinneren eller taperen på et spesialfelt eller hos en annen mus etterpå, skjer det ingenting (ingen ny duell).
- Under duellen har begge musene sinte øyenbryn og rister. Vinneren hopper av glede etterpå. Med redusert bevegelse: sinte øyenbryn, men ingen risting eller hopping, og terningene blinker ikke.
- Snakkeboblen (lilla) sier «⚔️ <vinner> vant duellen mot <taper>!». Slo musen 6, får den fortsatt kaste igjen etter duellen.
- Lyd: to sverd som slår mot hverandre når duellen starter, og en kort, glad tone til vinneren.
- Skjermleser (via `#terningTekst`): «⚔️ Duell! <A> mot <B>. Hver spiller trykker på sin egen Kast-knapp.» når duellen starter (fokus flyttes etter 0,6 sekunder, så meldingen ikke avbrytes), og «<navn> slo <tall> i duellen.» etter det første kastet. Når begge har kastet: «Duell: <A> slo <tall>, <B> slo <tall>.», fulgt av «Likt – kast igjen!» eller «<vinner> vant og går 2 felt frem. <taper> går 2 felt tilbake.». Kast-knappene heter «Kast for <navn>», og terningene «<navn> sin terning», også mens de ruller.
- Blir snakkeboblen for høy for den faste plassen (f.eks. ⏩ + duell + sekser med lange navn), får den mindre skrift (`.hendelse.liten`, og ved veldig brede navn `.hendelse.minst`), så «Kast terningen» ikke flytter seg.

### Seier og etter spillet

- Vinnermusen tar backflips ved osten, og konfetti faller over brettet i ca. 10 sekunder. Har man slått av animasjoner i operativsystemet, vises bare seiersteksten.
- Etter seieren byttes «Kast terningen» ut med «Se pallen 🏆», så man selv velger når man går videre.
- Pallen: plassering etter hvor langt musene kom. Står to likt, kommer den som kastet først foran. Navn over 12 tegn forkortes på pallen. Er det 4 spillere, står musen på 4. plass ved siden av pallen og gråter (blå tårer).
- Bare verten har «Spill igjen» og «Tilbake til lobby» på pallen. De andre ser «Venter på at verten velger «Spill igjen» eller «Tilbake til lobby» …». Verten kan trykke når den vil, og da skjer det hos alle (også de som ikke har åpnet pallen ennå).
- «Spill igjen» bruker samme spillere, pynt og brett, men spesialfeltene får nye plasser. «Tilbake til lobby» tar alle i rommet tilbake til lobbyen (samme kode), der verten kan velge et annet brett og nye spillere kan bli med. Spillere som har gått, fjernes da.

### Sidepanelet

- Panelet ved siden av brettet er et eget kort med lys bakgrunn, runde hjørner og myk skygge.
- Spillerlisten står øverst i panelet. Hver spiller er en avrundet «pille» med musikonet i en sirkel i en lys utgave av musens farge, med kant i musens farge (den hvite musen får i tillegg en tynn brun kant). På telefon er pillene litt mindre og står i rader under brettet.
- Den som har tur: oransje pille, litt større, fet tekst og «🎲 Din tur»-merkelapp. Når turen bytter, spretter den nye spilleren litt inn – men ikke når samme spiller kaster på nytt (sekser eller 🎲).
- Spillere som står over en runde får et 💤-merke og blir litt gjennomsiktige, fra de lander på kattefeltet til de har stått over.
- Statusteksten er stor og tydelig, med en prikk i fargen til musen som har tur. Har man selv tur, står det «Din tur, <navn>!», ellers «<navn> sin tur». Ved seier står det «Du kom først til osten og vant, <navn>!» hos vinneren.
- Ens egen mus har «(deg)» etter navnet i spillerlisten. «Kast terningen» kan bare trykkes av den som har tur, og er deaktivert (`aria-disabled`) hos de andre og mens hendelsene spilles av.
- Snakkeboblen har farge etter hva som skjedde (grønn ⏩, rød ⏪, gul 🎲, blå katt), fet og litt mørkere tekst, og en liten spiss som peker opp mot statusteksten. Den popper inn. Skjer to ting samtidig (f.eks. katten og en sekser), bestemmer det første fargen.
- Snakkeboblen har en fast plass (112 px høy), så terningen, «Kast terningen» og emoji-knappene står stille med og uten boble. Når den er tom, er plassen tom.
- Terningen er i «tegneserie»-stil: tykk kant, hard skygge rett under og runde hjørner. Den vipper mens den ruller.
- «Kast terningen» og «Se pallen» er tykke 3D-knapper med mørkere kant i bunnen. De løfter seg ved hover og trykkes ned ved klikk. Deaktivert er de grå, flate og står litt lavere.
- Emoji-reaksjoner: 👍 😂 😮 😢 🧀 🎉 som runde knapper under terningen. De blir større ved hover og spretter når man trykker, og emojien flyter opp over brettet. Reaksjonen sendes via serveren og flyter opp hos alle i rommet (issue #56).
- Hover-effektene gjelder bare på enheter med mus, så de ikke «henger igjen» på telefon. Med prefers-reduced-motion er sprett og vipp av.

### Logo, ikon og utseende

- Logo øverst: «DICE-MICE» som SVG rett i `index.html`. DICE er ost-gul med ostehull (et mønster som fyller bokstavene, så hullene alltid er inni dem) og brun osteaktig kant. MICE er grå med svak overgang (lysere øverst), museører på M og en rosa musehale på E. Bindestreken er brun.
- Logoen bruker Arial Black (med reserveskrifter). Bredden på hvert ord er låst, så ørene og halen havner riktig også med en annen skrift. Den er maks 460 px bred, vises på alle skjermene og leses som «Dice-Mice!» av skjermlesere.
- Fane-ikonet `favicon.svg` er osten fra brettet, med litt tykkere kant så den synes i den lille fanen.
- Bakgrunn: beige (#f4efe3) med rolige «ostehull» i litt mørkere beige, og en rund lys brettplate under spiralen. Den var lys himmelblå i issue #38, og ble beige igjen i issue #44.
- Siden tilpasser seg både telefon og PC, og trykk fungerer som klikk.

### Lyd og musikk

- Lydeffekter lages i nettleseren (Web Audio), uten lydfiler: terningen høres ut som en ekte terning som ruller (klakk som blir glissere, og et dunk når den stopper), musen sier «boing» når den hopper, egne lyder for spesialfeltene (katten hveser), og en fanfare ved seier. Knappen «🔊 Lyd på/av» øverst skrur dem av og på.
- Musikken (`public/assets/audio/tema.mp3`) starter når spillet starter (hos alle), og går i loop. Musikk-knappen (🎵) skrur den av og på. Har man skrudd den av med knappen, starter den ikke av seg selv igjen. En volumskyver ved siden av knappen styrer hvor høyt musikken spiller (0,4 fra start). Knappen og skyveren vises bare når sangfilen finnes.

### Testing og verktøy

- Testene bruker den ekte serveren (`server.js`) på `http://localhost:3000`, startet med `TESTMODUS=1`. Den gamle testserveren `.claude/test/server.js` er fjernet i issue #56. Flere spillere testes i hver sin fane.
- Testmodus: bare med `TESTMODUS=1` tar serveren imot `socket.emit('test', { posisjoner, spesial, kast, tur })`, som flytter musene, bytter spesialfelt og bestemmer de neste terningkastene. Uten `TESTMODUS` finnes ikke dette, så ingen kan jukse på nettet. Variablene i nettleseren er bare en kopi, så å endre dem endrer ikke spillet.
- Playwright kjører alltid synlig, så jeg kan se testene (før var den usynlig, fra issue #17). Den bruker Microsoft Edge, som følger med Windows (issue #45). Testeren sjekker `favicon.svg` med `fetch`, fordi fane-ikonet ikke alltid står i nettverkslisten. Knappens plass måles med `offsetTop`, fordi `getBoundingClientRect()` tar med løft- og trykk-animasjonen.
- Ingen lyd når `tester` og `tilgjengelighet` tester: rett etter hver gang siden åpnes, setter de `musikk.muted = true` og gir spillet en lydkontekst uten utgang (`lydKontekst = new AudioContext({ sinkId: { type: 'none' } })`, issue #49). Lyd- og musikk-knappene virker som vanlig og lydkoden kjører, men ingenting høres. Spillet selv er ikke endret.
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
- **Ny flyt: jeg skriver issuet, Claude gjør resten** (issue #41) – Claude leser issuet og gjør alt til en PR fra `test` til `main` er klar. Jeg merger den, og issuene lukkes da av `Closes #N`.
- **Playwright synlig og uten musikk under testing** (issue #45) – `--headless` er fjernet fra `.mcp.json`, Playwright bruker Edge (`--browser msedge`), og `tester` og `tilgjengelighet` demper musikken (`musikk.muted = true`) hver gang siden åpnes. Testet: BESTÅTT, `skjermbilder/45-*.png`.
- **Ingen lyd når Playwright tester** (issue #49) – testagentene gjør også lydeffektene stille, med en lydkontekst uten utgang. Testet: BESTÅTT, `skjermbilder/49-*.png`.
- **Beige bakgrunn igjen** (issue #44) – tilbake til den beige fra før #38 (#f4efe3 med ostehull i #ece2cb og #efe7d4). Resten av stilen og tilgjengelighetsrettingene fra #35 er beholdt. Testet: BESTÅTT, `skjermbilder/44-*.png`.
- **Dockerfile** (issue #52) – spillet kan kjøres i en container med nginx. Bare spillfilene er med. Sjekket med `docker build` og `docker run`: spillfilene og musikken gir 200, og `.git`, `CLAUDE.md` og `skjermbilder/` gir 404.
- **Maler for issues og PR-er** (issue #26) – `oppgave.md`, `feil.md` og `pull_request_template.md` i `.github/`. github-flyt-skillen bruker de samme malene, og tester-subagenten kjøres bare når spillet kan være påvirket. Malene vises på GitHub når de ligger i `main`.
- **Museduell** (issue #51) – lander en mus der en annen mus står, blir det duell. Hver spiller kaster sin egen terning: høyest går 2 felt frem, lavest 2 tilbake, og likt gir nytt kast. Musene ser sint på hverandre uten å røre hverandre, og vinneren hopper av glede. Detaljene står under «Museduell». Testet med `tester` (BESTÅTT, runde 4) og `tilgjengelighet` (funnene fra duellen er rettet). `skjermbilder/51-*.png`.
- **Flerspiller over nettet** (issue #56) – hver spiller på sin egen enhet, telefon og PC sammen. En Node-server (`server.js`, Express og Socket.IO) viser `public/`, og reglene ligger bare på serveren (`spillregler.js`): nettleseren sender ønsker («kast»), og serveren sender hendelsene og tilstanden til alle i rommet. Rom med kode, vert, lobby og emoji hos alle (detaljene står under «Spillere og start»). Ny `Dockerfile` med Node, og spillet ligger på Render (https://dice-mice.onrender.com). GitHub Pages sender videre til Render. Testet med Playwright: to faner og en fane i telefonstørrelse som egen enhet (`skjermbilder/56-*.png`), 1000 simulerte spill gjennom `spillregler.js`, `docker build`/`docker run`, og jeg har spilt på Render.

## Pågår og planlagt

- **Venter på svar fra meg** (eldre funn fra `tilgjengelighet` i issue #51, ikke fra duellen, kan bli egne issues): «Din tur»-pillen blir for bred på telefon med veldig brede navn (siden scroller sidelengs). Vinneren har fortsatt «Din tur» / «(har tur)» etter seier. Tekstene inni brett-SVG-en bør ha `aria-hidden`. Startskjermen mangler h2-overskrifter. Lite (12 px) skrift i `.hendelse.minst`.

- **Ikke bestemt ennå** (fra issue #56): om man skal kunne komme tilbake til samme spill etter å ha lastet siden på nytt.

## Senere (ikke lag før jeg ber om det)

- Ingenting akkurat nå.
