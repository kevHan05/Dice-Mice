# Dice-Mice!

Et terningspill over nettet som spilles med venner. Brettspill der mus kaster terning og løper i en spiral mot osten i midten.

## Regler for Claude (gjelder alltid)

1. Følg reglene i denne filen.
2. Vis meg alle endringer (diff) og vent på at jeg sier OK før du committer eller pusher.
3. Ikke legg til funksjoner, filer eller avhengigheter jeg ikke har beskrevet. Spør heller først.
4. Bruk bare vanlig HTML, CSS og JavaScript. Ingen rammeverk, biblioteker eller byggeverktøy.
5. All informasjon om spillet og kriteriene skal stå i denne filen. Oppdater den når spillet endres.
6. Skriv kode og kommentarer på norsk, slik resten av koden er (f.eks. `posisjoner`, `kastTerning`).

## Kjøre spillet

Åpne `Script/index.html` i nettleseren. Ingen installasjon trengs.

## Filer

- `Script/index.html` – siden
- `Script/style.css` – utseende
- `Script/game.js` – brett, mus, ost, terning og spillogikk

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
- 40 steg på spiralen (`ANTALL_STEG`).
- Musene har hver sin farge: grå, brun, hvit, svart.
- Man trenger ikke treffe osten nøyaktig – til eller forbi osten er seier.
- Ingen ekstra kast på sekser.
- Terningen ruller i 0,7 sekunder (`TRILLE_TID`), og hvert hopp tar 0,28 sekunder (`HOPP_TID`).
- Musene står litt og vipper mens de venter.
- Har man slått av animasjoner i operativsystemet, står musene stille og seiersfeiringen vises bare som tekst.
- Spillerlisten står over terningen, og den som har tur er markert med oransje ramme. På telefon står spillerne i en rad.
- Vinnermusen fortsetter å ta backflips til siden lukkes. Konfettien faller i ca. 10 sekunder.

## Faser

- **Fase 1: Planlegging – ferdig.** Brainstorming, kriterier, og en prototype som kjører lokalt.
- **Fase 2: Animasjon og UI – pågår.** Se under.

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

## Senere (ikke lag før jeg ber om det)

- Steg på brettet som gjør forskjellige ting når man lander på dem
- Brettet: feltet musen kommer til å lande på lyser opp før den hopper.
- Brettet: tilfeldig brett, der spesialfeltene ligger på nye plasser hver runde.
- Brettet: flere brett å velge mellom (f.eks. kort og lang spiral).
- Emoji-reaksjoner spillerne kan sende til hverandre under spillet.
- Etter spillet: en pall med musene på 1., 2. og 3. plass. Er det 4 spillere, står den siste musen ved siden av pallen og gråter.
- Etter spillet: valg mellom «Spill igjen» (samme spillere) og «Tilbake til lobby».
- Dekorere musene
- Bakgrunn
- Musikk (SUNO)
- Lydeffekter
- Spille over nettet: hver spiller på sin egen enhet, telefon og PC sammen. Hvordan dette skal løses teknisk, er ikke bestemt ennå.
