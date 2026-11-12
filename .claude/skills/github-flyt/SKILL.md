---
name: "github-flyt"
description: "Følg issue → branch → commit → push → PR → merge-flyten i Dice-Mice!. Bruk når brukeren vil starte en ny oppgave, lage issue, branch, commit, PR eller merge, selv om de bare sier «ny oppgave» eller «jeg vil legge til X»."
---

# GitHub-flyt for Dice-Mice!

Brukeren lærer GitHub-flyten og vil at hver oppgave skal gå gjennom de samme stegene, med samme navngivning. Svar på norsk, og forklar kort hva kommandoene gjør hvis brukeren spør.

Hvis du kan kjøre kommandoer selv (for eksempel i Claude Code i Dice-Mice-mappen), kjør dem og vis resultatet. Ellers: gi kommandoene klare til å lime inn, ett steg om gangen, og vent på at brukeren sier fra før neste steg.

## 1. Issue
Skriv issuet i Markdown som brukeren kan lime inn på GitHub (eller opprett det med `gh issue create` hvis det er tilgjengelig):

```markdown
## Beskrivelse
<hva og hvorfor, 1–2 setninger>

## Oppgaver
- [ ] <konkret oppgave>
- [ ] <konkret oppgave>

## Ferdig når
- <hvordan vi vet at det fungerer>
- Testet i nettleseren
```

Noter issue-nummeret (#N) — det brukes i alle stegene under.

## 2. Branch
Navn: `<N>-<kort-beskrivelse>` med små bokstaver og bindestrek, for eksempel `1-bakgrunnsmusikk`.

```bash
git switch main
git pull
git switch -c <N>-<kort-beskrivelse>
git branch
```

`git pull` før ny branch er lett å glemme — ta det alltid med. `git branch` bekrefter at stjernen står ved den nye branchen.

## 3. Endringen
Hjelp med selve koden. Prosjektets filer ligger i `Script/` (`game.js`, `index.html`, `style.css`), og lyd i `assets/audio/`.

## 4. Commit
```bash
git status
git add .
git commit -m "<issue-tittel> #<N>"
```

Kjør `git status` før `git add .`, så ingenting uønsket blir med. Advarsler om «LF will be replaced by CRLF» er ufarlige på Windows; nevn at `.gitattributes` med `* text=auto` fjerner dem hvis brukeren lurer.

## 5. Push
```bash
git push -u origin <branch>
```

`-u` trengs bare første gang for en branch.

## 6. Pull Request
- Tittel: samme som issue-tittelen.
- Beskrivelse: kort hva og hvorfor, og avslutt med `Closes #<N>` på egen linje.

Viktig: `Closes #N` må stå i beskrivelsen, ikke bare i tittelen, og må bruke et engelsk nøkkelord (Closes/Fixes/Resolves). Be brukeren sjekke at issuet vises under **Development** i høyre kolonne før merge — ellers lukkes det ikke automatisk. Dette gikk galt første gang.

## 7. Merge og opprydding
Etter at PR-en er merget på GitHub:

```bash
git switch main
git pull
git branch -d <branch>
```

Sjekk til slutt at issuet er lukket. Hvis ikke: lukk det for hånd med en kommentar som «Løst i PR #<nummer>».