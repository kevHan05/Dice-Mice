---
name: "github-flyt"
description: "Følg flyten i Dice-Mice!: brukeren skriver et issue på GitHub og ber Claude lese det (f.eks. «les issue #42») → Claude gjør alt imellom: gjør test lik main, branch fra test, endring, testing med tester-subagenten (Playwright) når spillet er endret, commit, push, PR til test og merge i test → Claude lager eller oppdaterer én PR fra test til main med Closes #N → brukeren merger den på GitHub. Bruk når brukeren ber deg lese et issue, beskriver en ny oppgave eller endring (selv om de bare sier «ny oppgave» eller «jeg vil legge til X»), eller spør om test → main."
---

# GitHub-flyt for Dice-Mice!

Brukeren lærer GitHub og vil at hver oppgave går gjennom de samme stegene, med samme navngivning. Svar på norsk, og forklar kort hva kommandoene gjør hvis brukeren spør.

Det finnes to faste brancher:
- **`main`** – det som er ferdig og publisert (GitHub Pages viser `main`).
- **`test`** – her samles alle endringer før de går til `main`.

Fordelingen av arbeidet:
1. **Brukeren** skriver issuet på GitHub og ber deg lese det («les issue #42»).
2. **Du** gjør alt imellom, uten å spørre underveis (regel 2 i CLAUDE.md): steg 1–9 under.
3. **Brukeren** merger PR-en fra `test` til `main` på GitHub. Det er brukerens godkjenning – **du merger aldri til `main` selv**.

## 1. Les issuet

```bash
gh issue view <N> --comments
```

Brukeren skriver issuet selv, og det kan være kort (for eksempel bare én setning). Forstå hva som skal gjøres. Er noe helt uklart og kan bety flere ting, spør brukeren – ellers ta et fornuftig valg og skriv det i CLAUDE.md under «Valg i prototypen».

Skriv en kort kommentar i issuet med planen, så den står der for brukeren og andre:

```bash
gh issue comment <N> --body "Plan: <hva du skal gjøre, i noen punkter>"
```

**Ber brukeren deg om en oppgave uten å ha laget issue** (de forklarer den bare i chatten): lag issuet selv med `gh issue create`, med samme oppsett som malene i `.github/ISSUE_TEMPLATE/` – `oppgave.md` (*Beskrivelse*, *Oppgaver*, *Ferdig når*) for nye ting og endringer, `feil.md` (*Hva skjedde*, *Hva forventet jeg*, *Hvordan gjenskape*, *Telefon eller PC*) for feil.

Er issuet allerede lukket, eller er det en PR og ikke et issue, si fra til brukeren.

## 2. Gjør test lik main, og lag branch fra test

Brukeren kan ha merget `test` inn i `main` siden sist. Da har `main` en merge-commit som `test` mangler. Gjør derfor alltid `test` lik `main` først:

```bash
git switch test
git pull
git fetch origin
git merge --ff-only origin/main
git push
git switch -c <N>-<kort-beskrivelse>
git branch
```

Navn: `<N>-<kort-beskrivelse>` med små bokstaver og bindestrek, for eksempel `42-ny-katt`. `git branch` bekrefter at stjernen står ved den nye branchen.

Feiler `git merge --ff-only origin/main`, betyr det at `test` har endringer som ikke er i `main` ennå (brukeren har ikke merget PR-en fra `test` til `main`). Det er greit: hopp over `merge`- og `push`-linjen, og lag branchen fra `test` som den er. Endringene samles da i den samme åpne PR-en til `main`.

## 3. Endringen

1. Skriv planen inn i CLAUDE.md **før** du lager noe (regel 7), under «Pågår og planlagt».
2. Lag endringen. Prosjektets filer ligger i rotmappen (`index.html`, `style.css`, `game.js`), og lyd i `assets/audio/`.
3. Hookene i `.claude/settings.json` retter filformatet og sjekker JavaScript for syntaksfeil automatisk hver gang du endrer en fil.
4. Flytt oppgaven til «Ferdig» i CLAUDE.md når den er laget.

## 4. Testing

**Kjør tester-subagenten bare når spillet kan være påvirket** – det vil si når oppgaven endrer `index.html`, `style.css`, `game.js`, `favicon.svg` eller filer i `assets/`, eller selve testoppsettet (`.claude/agents/tester.md`, `.claude/test/server.js`, `.mcp.json`). Ellers er det ikke vits.

Kjør da subagenten **`tester`** (Agent-verktøyet, `subagent_type: "tester"`). Den tester spillet i en ekte nettleser med Playwright og tar skjermbilder til `skjermbilder/`. Gi den:
- issue-nummeret (brukes i navnet på skjermbildene),
- hva som er endret, og hva den skal sjekke spesielt.

Rapporterer den **FEILET**: rett feilen og kjør testeren på nytt, til den rapporterer **BESTÅTT**. Ikke gå videre til commit med en feilende test. Er Playwright ikke koblet til, si fra til brukeren (`/mcp` → playwright → Reconnect) og ikke merge før testen har kjørt – med mindre brukeren sier at testen skal hoppes over.

**Er spillet ikke endret** (for eksempel README, CLAUDE.md, maler, skillen eller hookene): sjekk selv det som er endret – at lenker og bilder finnes, at filer har riktig format (for eksempel gyldig JSON), og at innholdet stemmer med spillet. Skriv i PR-en hva du sjekket.

**Tilgjengelighet:**
- `tester` gjør alltid en **kort tilgjengelighetssjekk av det som er endret** (navn, tastatur og fokus, størrelse på telefon, kontrast). Bare nye problemer som endringen lager, gjør testen FEILET; kjente problemer står i «Kjente tilgjengelighetsproblemer» i CLAUDE.md. Retter en oppgave et kjent problem, fjern det fra listen.
- Den fulle sjekken, subagenten **`tilgjengelighet`** (`subagent_type: "tilgjengelighet"`), kjøres **bare når brukeren ber om det, eller når oppgaven handler om tilgjengelighet** – ikke på hver PR. Den bare rapporterer; vil brukeren rette noe av det den finner, blir det egne issues.

## 5. Commit

```bash
git status
git add <filene som hører til oppgaven>
git commit -m "<issue-tittel> #<N>"
```

Kjør `git status` først, så ingenting uønsket blir med. Skjermbildene fra testeren i `skjermbilder/` skal være med. `.playwright-mcp/` holdes utenfor av `.gitignore`.

## 6. Push og PR til test

```bash
git push -u origin <branch>
gh pr create --base test --head <branch> --title "<issue-tittel>" --body "<beskrivelse etter PR-malen>"
```

Beskrivelsen følger `.github/pull_request_template.md`:

```markdown
## Hva og hvorfor
<hva er endret, og hvorfor – kort>

## Hvordan testet
<tester-subagenten: BESTÅTT + skjermbilder – eller hva du sjekket selv hvis spillet ikke er endret>

Løser #<N>
```

PR-en går til **`test`**, aldri rett til `main`. «Løser #N» lager bare en lenke til issuet – `Closes #N` virker ikke ved merge til `test`.

## 7. Merge i test

```bash
gh pr merge <PR-nummer> --merge --delete-branch
git switch test
git pull
```

**Ikke lukk issuet** – det lukkes av seg selv når brukeren merger PR-en fra `test` til `main` (steg 8). Et åpent issue betyr altså «ikke ute på nettsiden ennå».

## 8. PR fra test til main

Sjekk om det allerede finnes en åpen PR fra `test` til `main`:

```bash
gh pr list --base main --head test --state open
```

- **Finnes den ikke:** lag den.
  ```bash
  gh pr create --base main --head test --title "Fra test til main: <kort oppsummering>" --body "<beskrivelse etter PR-malen>"
  ```
- **Finnes den:** den viser allerede de nye commitene (den følger `test`). Oppdater beskrivelsen og tittelen så det nye issuet er med:
  ```bash
  gh pr edit <PR-nummer> --title "…" --body "…"
  ```

Beskrivelsen følger PR-malen: under *Hva og hvorfor* listes hvert issue som er med (med lenke til PR-en til `test`), under *Hvordan testet* hva som ble testet i hvert av dem, og til slutt **én `Closes #N`-linje per issue** – her virker Closes, fordi PR-en merges til `main`, så issuene lukkes av seg selv når brukeren merger.

Finn alle issuene som er med med `git log --oneline origin/main..test` (commit-meldingene slutter med `#N`).

**Ikke merge denne PR-en selv.** Det gjør brukeren på GitHub.

## 9. Vis brukeren resultatet

Fortell brukeren:
- issuet og PR-en til `test` (med lenker), og at den er merget i `test`,
- hva som er endret (oppsummering og de viktigste delene av diffen),
- resultatet fra tester-subagenten og skjermbildene (eller hva du sjekket selv),
- lenken til PR-en fra `test` til `main`, og at det neste – og eneste – brukeren må gjøre, er å merge den på GitHub. Da kommer endringen ut på nettsiden (GitHub Pages oppdaterer seg etter et minutt eller to), og issuene lukkes.

## Ting som er lette å gjøre feil

- Glemme å gjøre `test` lik `main` før ny branch (steg 2).
- Lage PR til `main` fra en oppgave-branch i stedet for fra `test`.
- Lukke issuet ved merge i `test` – det skal stå åpent til brukeren merger til `main`.
- Glemme `Closes #N` for et issue i PR-en fra `test` til `main`.
- Merge til `main` selv – det er brukerens jobb.
- Slette `test`-branchen.
- Kjøre tester-subagenten når spillet ikke er endret – eller glemme den når det er det.
- Glemme at malene i `.github/` (og endringer i dem) først dukker opp på GitHub når de ligger i `main`.
