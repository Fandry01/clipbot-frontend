# agents.md – ClipBot Frontend

Deze agent werkt **alleen in de frontend** van ClipBot.

- Geen backend-code aanpassen.
- Geen nieuwe backend-endpoints “verzinnen”.
- Backend-contracten zijn wat ze zijn; de waarheid staat in `src/api/types.ts`.

De agent helpt met:

- React/TypeScript componenten
- Hooks in `src/api/hooks.ts`
- UI/UX rond bestaande API-calls
- Refactors, bugfixes en kleine features aan de frontend-kant

---

## 1. Tech stack & structuur

**Stack**

- React + TypeScript  
- React Router  
- TanStack React Query (`@tanstack/react-query`)  
- Axios (`src/api/client.ts`)  
- TailwindCSS + custom utility-classes (`btn-*`, `card`, `badge`, etc.)

**Belangrijke mappen**

- `src/api/`
  - `client.ts` – axios instance, auth helpers, owner subject constant.
  - `file.ts` – `fileOutUrl` / `fileOutDownloadUrl`.
  - `types.ts` – alle API types, **bron van waarheid voor contracts**.
  - `hooks.ts` – data hooks met React Query, rond de bestaande API.
- `src/components/` – herbruikbare componenten (Player, ProjectCard, etc.).
- `src/pages/` – pagina’s (Overview, MediaDetail, ClipEditor, MeSettings, …).

**Regel:**  
Bij twijfel eerst in `types.ts` en `hooks.ts` kijken; daar staan de contracts.

---

## 2. API & data-laag – regels

1. **Gebruik altijd `api` uit `src/api/client.ts`**  
   - Nooit losse `axios`-instances naast `api`.
   - `baseURL` en eventuele headers komen uit `client.ts`.

2. **Respecteer `types.ts`**
   - Types daar representeren de backend.
   - Pas ze alleen aan als het echt nodig is en zorg dat alle hooks/components nog kloppen.
   - Geen “stiekeme” `as any` om typefouten te verbergen.

3. **Hooks bovenin, UI onderin**
   - Nieuwe API-flow?  
     → Eerst een hook in `src/api/hooks.ts` (met React Query), pas daarna gebruiken in een component/pagina.
   - Query keys duidelijk en stabiel houden, bijv.:
     - `['projects', 'bySubject', subject, page, size]`
     - `['clip', clipId]`
     - `['asset-latest', clipId, kind]`

4. **Files & assets**
   - Nooit zelf `/media/...` of `/files/...` URL’s samenstellen.
   - **Altijd** via:
     - `fileOutUrl(objectKey)`
     - `fileOutDownloadUrl(objectKey)`
   - Voor clip-assets gebruik je de bestaande hooks (zoals `useLatestClipAsset`) of een helper zoals `useClipPlayerSources`.

5. **ownerExternalSubject**
   - `ownerExternalSubject` komt uit `client.ts` (bijv. `OWNER_EXTERNAL_SUBJECT`).
   - Subject-gebaseerde hooks (projects, media-koppelingen, assets) moeten deze gebruiken.
   - Geen eigen subject uit `localStorage` of random strings verzinnen.

---

## 3. Code style – namen & structuur

### 3.1 Namen van functies, variabelen en hooks

**Algemene regels**

- Namen zijn **duidelijk en beschrijvend**, geen vage afkortingen.
  - Goed: `fetchProjectClips`, `mediaId`, `uploadProgress`, `handleDetectClick`
  - Slecht: `fp`, `id2`, `doStuff`, `xData`
- Houd je aan conventies:
  - React components: `PascalCase`
  - Hooks: `useXxx` (en ze **doen** ook iets met React state/effects/query)
  - Event handlers: `handleXxx` of `onXxxClick`
- Booleans beginnen bij voorkeur met `is/has/can/should`:
  - `isLoading`, `hasError`, `canRender`, `shouldRedirect`

**Props & types**

- Props-typen expliciet definiëren:
  - `type Props = { project: ProjectListItem }`
  - `function Component({ project }: Props) { ... }`
- Geen anonieme `any` types; als iets echt onbekend is, liever:
  - `unknown` + type guards
  - of een duidelijk TODO-comment.

### 3.2 Structuur van componenten

- Componenten klein en gericht houden:
  - UI in componenten
  - Data-fetching in hooks
- Lange componenten (>300 regels) splitsen:
  - Uitbesteden aan kleinere subcomponenten (`Header`, `Sidebar`, `List`, …)
  - Of logica naar custom hooks (`useClipEditorState`, `useMediaDetailData`)

- Geen gigantische inline-functies in JSX:
  - Haal callbacks naar boven (`const handleSave = () => { ... }`).

---

## 4. Logging – wat en hoe

We willen **duidelijke en bruikbare logging**, niet stil falende code en geen log-spam.

### 4.1 Wanneer loggen?

**Wel loggen:**

- API-fouten die niet al via een toast of error-ui zichtbaar zijn.
- Onverwachte states:
  - ontbrekende data die “nooit” null zou mogen zijn (met defensieve fallback).
  - branches waarvan we niet zeker zijn of ze ooit gebeuren.
- Belangrijke gebruikersacties die mislopen:
  - detect faalt,
  - upload afgebroken,
  - render job niet gestart.

**Niet loggen:**

- Elke render of kleine state-wijziging.
- Grote responses/objecten onnodig (geen megabytes naar console).
- Gevoelige info (auth-tokens, e-mail, etc.).

### 4.2 Hoe loggen?

Gebruik de standaard console-methodes:

- `console.error('message', contextObject)`  
  Voor fouten – inclusief de originele error (stack).
- `console.warn('message', contextObject)`  
  Voor onzekere situaties / recoverable issues.
- `console.info('message', contextObject)`  
  Voor high-level events (optioneel en spaarzaam).

**Stijl:**

- Korte, duidelijke, Engelstalige messages:
  - `console.error('Failed to enqueue detect job', { mediaId, error })`
  - `console.warn('Clip asset not found', { clipId, kind })`
- Altijd context meegeven (id’s, relevante params).
- Als er ook een user-facing toast is:
  - log met `console.error` voor debugging,
  - gebruik `useToast().error('…')` voor de gebruiker.

**Geen silent catch:**

- Geen lege `catch {}` blocks.
- Altijd:
  - loggen **of**
  - de fout via `getErr(e)` aan de UI geven (toast, error state).

---

## 5. Richtlijnen voor de agent

Bij elke wijziging:

1. **Frontend-only**
   - Wijzig alleen frontend-bestanden.
   - Verander geen backend-contracten; als het contract niet klopt met de code, markeer met TODO en hou de TS-types aan als waarheid.

2. **Geen nieuwe dependencies**
   - Gebruik wat er al is (React, React Query, Axios, Tailwind).
   - Geen extra packages installeren.

3. **Eerst types & hooks, dan UI**
   - Klopt een type niet? Fix eerst `types.ts`.
   - Nieuwe data-flow? Voeg eerst/gebruik een hook in `hooks.ts`.
   - Daarna pas UI-componenten en pages aanpassen.

4. **Respecteer bestaande patterns**
   - React Query: `useQuery`/`useMutation` met duidelijke `queryKey`.
   - Geen eigen fetch-lagen naast `api`.
   - Gebruik `fileOutUrl`/`fileOutDownloadUrl` voor alle file/asset-URLs.

5. **Clean code over snel hacken**
   - Duidelijke namen.
   - Kleine, goed-benoemde helpers.
   - Logging op de juiste plekken.
   - Liever een TODO-comment dan een riskante gok op backend-gedrag.

---

## 6. Wat mag je wél automatisch doen?

- Hooks uitbreiden of maken (`useClip`, `useClipPlayerSources`, etc.).
- Pages laten aansluiten op bestaande hooks (Overview/MediaDetail/ClipEditor).
- Player correct voeden met `src/poster/subtitles` via assets.
- MeSettings koppelen aan plan/usage-data uit `useMe`.
- Bugfixes in types/props/hook-calls die compile-fouten geven.

---

## 7. Wat mag je níet uit jezelf doen?

- Nieuwe backend-endpoints aannemen of hardcoderen.
- Business rules (quota, trial, watermark) vanuit frontend “bedenken”.
- Grote refactors over de hele codebase zonder noodzaak.
- Logging spammen (console.log in elke render).

---
