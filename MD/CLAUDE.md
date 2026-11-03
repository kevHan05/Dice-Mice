# Dice-Mice!

Et terningspill over nettet.

## Kriterier for arbeidet (gjelder alltid)

- Forhold deg til reglene som er gitt i denne filen (CLAUDE.md).
- Gi meg muligheten til å se endringer før de committes.
- Ikke legg til noe jeg ikke har beskrevet først.
- Bruk HTML, CSS og JavaScript (JS).
- All informasjon om spillet og kriteriene skal lagres i CLAUDE.md.

## Fase 1: Planlegging

Uken består av brainstorming og planlegging av spillets prototype, og deretter å lage den og kjøre den lokalt på maskinen med Claude. Kriteriene over drøftes før koden settes i gang.

## Spillet

- Hver spiller er en mus som starter på «START»-plassen på brettet.
- Spillerne får hver sin tur, der de kaster en terning og flytter musen sin fremover like mange steg som terningen viser.
- Målet er å komme først til osten i midten.

### Brettet

- Et sirkulært brett der stegene går i en spiral mot midten.
- *Senere:* steg man lander på som gjør forskjellige ting.

### Musene

- En enkel tegning av en mus med ører og hale.
- *Senere:* mulighet til å dekorere musene.

### Osten

- Et ostestykke, skåret ut som et kakestykke fra en stor rund ost.

## Valg i første utkast (foreløpige, kan endres)

Ting som ikke var beskrevet, men som utkastet måtte ha en verdi for:

- Antall spillere: 2 (kan settes til 1–4 med `ANTALL_SPILLERE` i `Script/game.js`). Alle spiller på samme maskin.
- Antall steg på spiralen: 40 (`ANTALL_STEG`).
- Musene har ulik farge, så man ser hvem som er hvem.
- Man trenger ikke treffe osten nøyaktig – kommer man til eller forbi osten, har man vunnet.
- Ingen ekstra kast på sekser.

## Filer

- `Script/index.html` – siden
- `Script/style.css` – utseende
- `Script/game.js` – brett, mus, ost, terning og spillogikk

## Senere tillegg

- Bakgrunn
- Musikk (SUNO)
- Lydeffekter
- Startskjerm
