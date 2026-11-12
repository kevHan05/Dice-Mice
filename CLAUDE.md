# Dice-Mice!

Et terningspill over nettet som spilles med venner. Brettspill der mus kaster terning og løper i en spiral mot osten i midten.

## Regler for Claude (gjelder alltid)

1. Følg reglene i denne filen.
2. Vis meg alle endringer (diff) og vent på at jeg sier OK før du committer eller pusher.
3. Ikke legg til funksjoner, filer eller avhengigheter jeg ikke har beskrevet. Spør heller først.
4. Bruk bare vanlig HTML, CSS og JavaScript. Ingen rammeverk, biblioteker eller byggeverktøy.
5. All informasjon om spillet og kriteriene skal stå i denne filen. Oppdater den når spillet endres.
6. Skriv kode og kommentarer på norsk, slik resten av koden er (f.eks. `posisjoner`, `kastTerning`).
7. Når vi planlegger noe nytt, skriv det inn i denne filen med en gang – før det lages.

## Kjøre spillet

Åpne `Script/index.html` i nettleseren. Ingen installasjon trengs.

## Filer

- `Script/index.html` – siden
- `Script/style.css` – utseende
- `Script/game.js` – brett, mus, ost, terning, spillogikk og lyd
- `assets/audio/tema.mp3` – bakgrunnsmusikken (SUNO-sangen)

Git: `https://github.com/kevHan05/Dice-Mice.git`, gren `main`.

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

## Senere (ikke lag før jeg ber om det)

- Spille over nettet: hver spiller på sin egen enhet, telefon og PC sammen. Hvordan dette skal løses teknisk, er ikke bestemt ennå.
