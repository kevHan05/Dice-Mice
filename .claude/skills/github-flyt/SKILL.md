---
name: "github-flyt"
description: "Følg flyten i Dice-Mice!: brukeren forklarer en oppgave → Claude lager issue på GitHub → branch fra test → endring → testing med tester-subagenten (Playwright) når spillet er endret → commit → push → PR til test → merge i test → lukk issuet. Og test → main når brukeren sier fra. Bruk når brukeren beskriver en ny oppgave eller endring (selv om de bare sier «ny oppgave», «ny issue» eller «jeg vil legge til X»), eller vil sende test til main."
---

# GitHub-flyt for Dice-Mice!

Brukeren lærer GitHub og vil at hver oppgave går gjennom de samme stegene, med samme navngivning. Svar på norsk, og forklar kort hva kommandoene gjør hvis brukeren spør.

Det finnes to faste brancher:
- **`main`** – det som er ferdig og publisert (GitHub Pages viser `main`).
- **`test`** – her samles alle endringer før de går til `main`.

Brukeren forklarer en oppgave med egne ord. Du gjør **alt** fra issue til merge i `test` selv, uten å spørre underveis (regel 2 i CLAUDE.md). Det er bare **`test` → `main`** som krever OK fra brukeren.

## 1. Issue

Lag issuet på GitHub ut fra det brukeren forklarte, med `gh issue create --title "…" --body "…"`. Bruk samme oppsett som malene i `.github/ISSUE_TEMPLATE/` (de samme malene man får når man lager issue på GitHub):

- **Ny oppgave eller endring** – `oppgave.md`:
  ```markdown
  ## Beskrivelse
  <hva og hvorfor, 1–2 setninger>

  ## Oppgaver
  - [ ] <konkret oppgave>
  - [ ] <konkret oppgave>

  ## Ferdig når
  - <hvordan vi vet at det fungerer>
  - Testet med tester-subagenten (Playwright), hvis spillet er endret
  ```
- **Feil i spillet** – `feil.md`: overskriftene *Hva skjedde*, *Hva forventet jeg*, *Hvordan gjenskape* (nummererte steg) og *Telefon eller PC*.

Noter issue-nummeret (#N). Er noe i oppgaven helt uklart og kan bety flere ting, spør brukeren før du lager issuet – ellers ta et fornuftig valg og skriv det i CLAUDE.md under «Valg i prototypen».

## 2. Branch fra test

Navn: `<N>-<kort-beskrivelse>` med små bokstaver og bindestrek, for eksempel `16-ny-katt`.

```bash
git switch test
git pull
git switch -c <N>-<kort-beskrivelse>
git branch
```

`git pull` før ny branch er lett å glemme – ta det alltid med. `git branch` bekrefter at stjernen står ved den nye branchen.

## 3. Endringen

1. Skriv planen inn i CLAUDE.md **før** du lager noe (regel 7).
2. Lag endringen. Prosjektets filer ligger i rotmappen (`index.html`, `style.css`, `game.js`), og lyd i `assets/audio/`.
3. Hooken i `.claude/settings.json` retter filformatet automatisk hver gang du endrer en fil (LF-linjeskift, ingen mellomrom på slutten av linjer, ett linjeskift til slutt). Du trenger ikke gjøre det selv.
4. Merk det som er laget med *(Laget.)* i CLAUDE.md.

## 4. Testing

**Kjør tester-subagenten bare når spillet kan være påvirket** – det vil si når oppgaven endrer `index.html`, `style.css`, `game.js`, `favicon.svg` eller filer i `assets/`, eller selve testoppsettet (`.claude/agents/tester.md`, `.claude/test/server.js`, `.mcp.json`). Ellers er det ikke vits.

Kjør da subagenten **`tester`** (Agent-verktøyet, `subagent_type: "tester"`). Den tester spillet i en ekte nettleser med Playwright og tar skjermbilder til `skjermbilder/`. Gi den:
- issue-nummeret (brukes i navnet på skjermbildene),
- hva som er endret, og hva den skal sjekke spesielt.

Rapporterer den **FEILET**: rett feilen og kjør testeren på nytt, til den rapporterer **BESTÅTT**. Ikke gå videre til commit med en feilende test.

**Er spillet ikke endret** (for eksempel README, CLAUDE.md, maler, skillen eller hooken): sjekk selv det som er endret – at lenker og bilder finnes, at filer har riktig format (for eksempel gyldig JSON), og at innholdet stemmer med spillet. Skriv i PR-en hva du sjekket.

## 5. Commit

```bash
git status
git add .
git commit -m "<issue-tittel> #<N>"
```

Kjør `git status` før `git add .`, så ingenting uønsket blir med. Skjermbildene fra testeren i `skjermbilder/` skal være med. `.playwright-mcp/` holdes utenfor av `.gitignore`.

## 6. Push og PR til test

```bash
git push -u origin <branch>
gh pr create --base test --head <branch> --title "<issue-tittel>" --body "<beskrivelse etter PR-malen>"
```

Beskrivelsen følger `.github/pull_request_template.md` (den samme malen man får når man lager PR på GitHub):

```markdown
## Hva og hvorfor
<hva er endret, og hvorfor – kort>

## Hvordan testet
<tester-subagenten: BESTÅTT + skjermbilder – eller hva du sjekket selv hvis spillet ikke er endret>

Løser #<N>
```

PR-en skal alltid gå til **`test`**, aldri rett til `main`.

Viktig: `Closes #N` lukker bare issuet når en PR merges til `main` (standard-branchen). Til `test` gjør den ingenting. Derfor står det «Løser #N» på Closes-linjen i PR-er til `test` (det lager en lenke), og issuet lukkes for hånd i neste steg.

## 7. Merge i test og lukk issuet

```bash
gh pr merge <PR-nummer> --merge --delete-branch
gh issue close <N> --comment "Løst i PR #<PR-nummer>, merget i test."
git switch test
git pull
```

Sjekk at branchen er borte (`git branch -a`) og at issuet er lukket.

## 8. Vis brukeren resultatet

Når alt er merget i `test`, vis brukeren:
- issue og PR (med lenker),
- hva som er endret (oppsummering og diff: `git diff <test før>..test`),
- resultatet fra tester-subagenten og skjermbildene,
- at endringen ligger i `test` og venter på å bli sendt til `main`.

## 9. test → main (bare når brukeren sier fra)

Når brukeren sier for eksempel «send test til main»:

```bash
git switch test
git pull
git log --oneline main..test
gh pr create --base main --head test --title "Fra test til main: <kort oppsummering>" --body "<beskrivelse etter PR-malen>"
```

Beskrivelsen følger også PR-malen: under *Hva og hvorfor* listes issuene og PR-ene som er med, under *Hvordan testet* hva som ble testet i hver av dem, og til slutt én `Closes #N`-linje per issue (her virker Closes, fordi PR-en merges til `main`).

Vis brukeren hva som er med (issuene og diffen `git diff main..test`), og **vent på OK**. Etter OK:

```bash
gh pr merge <PR-nummer> --merge
git switch main
git pull
git switch test
git merge --ff-only main
git push
```

Ikke bruk `--delete-branch` her – `test` skal aldri slettes. De siste linjene holder `test` lik `main` etter merge. GitHub Pages oppdaterer nettsiden av seg selv etter et minutt eller to.

## Ting som er lette å gjøre feil

- Glemme `git pull` før ny branch.
- Lage PR til `main` i stedet for `test`.
- Tro at issuet lukkes av seg selv ved merge i `test` – det gjør det ikke.
- Slette `test`-branchen ved merge til `main`.
- Kjøre tester-subagenten når spillet ikke er endret – eller glemme den når det er det.
- Glemme at malene i `.github/` (og endringer i dem) først dukker opp på GitHub når de ligger i `main`.
