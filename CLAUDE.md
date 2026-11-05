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

## Faser

- **Fase 1: Planlegging – ferdig.** Brainstorming, kriterier, og en prototype som kjører lokalt.
- **Fase 2: Animasjon og UI – pågår.** Se under.

## Fase 2: Animasjon og UI

### Animasjoner

- Musen hopper felt for felt fremover i stedet for å flytte seg rett til det nye feltet.
- Terningen ruller før den viser tallet.
- Seiersfeiring når en mus kommer til osten.
- Musene beveger seg litt mens de står i ro.

### UI

- Startskjerm før spillet begynner. *(Laget.)*
- På startskjermen velger man antall spillere (1–4). *(Laget.)*
- Hver spiller skriver inn sitt eget navn. Ved siden av navnefeltet vises musen spilleren får. *(Laget.)*
- Under spillet vises en spillerliste med hvem som er med og hvem sin tur det er.

### Ikke bestemt ennå

- Stil/tema for spillet. Ikke velg en ny stil – behold dagens utseende til jeg har bestemt meg.
- Hvordan seiersfeiringen skal se ut. Spør meg før du lager den.

## Senere (ikke lag før jeg ber om det)

- Steg på brettet som gjør forskjellige ting når man lander på dem
- Dekorere musene
- Bakgrunn
- Musikk (SUNO)
- Lydeffekter
- Spille over nettet (nå spiller alle på samme maskin)
