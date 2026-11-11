# project-vocab

Vocabulary memorization app. Vue 3 (Composition API, `<script setup>`) + Pinia + vue-router
frontend, FastAPI + psycopg2 + PostgreSQL backend. Single developer, single repo.

---

# A. Architecture

## Running

| what | command / file |
|---|---|
| frontend (dev) | `npm run dev` → Vite, **port 443**, HTTPS (certificate `config/vite/OS.ts`) |
| type check | `npm run type-check` (`vue-tsc`) |
| lint / format | `npm run lint`, `npm run format` |
| backend | `main/src/backend/__main__.py` → uvicorn, port **5174**, HTTPS |
| dependencies | `package.json`, `requirements.txt` |

### The user starts the servers

Claude does **not** start the frontend and backend — it tells the user which command to type.
When needed, pass this on verbatim (two separate terminals):

**Frontend** (from the repo root):
```
cd C:\Users\okana\custom\github-projects-already-stored\project-vocab
npm run dev
```
→ `https://localhost` (port 443, no need to type the port in the address).

**Backend** (venv + from the `main\src` folder):
```
cd C:\Users\okana\custom\github-projects-already-stored\project-vocab
.\.venv\Scripts\Activate.ps1
cd main\src
python -m backend
```
→ `https://localhost:5174`. A one-liner also works instead of activation:
`..\..\.venv\Scripts\python.exe -m backend` (again from inside `main\src`).

Pitfalls:
- **The backend is not started outside `main\src`** — `__main__.py` reads both `hidden/.env`
  and the certificates via relative paths.
- If `Activate.ps1` says "running scripts is disabled":
  `Set-ExecutionPolicy -Scope Process RemoteSigned`.
- `ECONNREFUSED /initialData` in the proxy = the backend is not up; it is not a frontend problem.
- Certificates are mkcert (localhost / 127.0.0.1 / 192.168.178.26, valid until 2028).
  If the browser warns, the root CA is not installed: `winget install FiloSottile.mkcert` +
  `mkcert -install`. As a temporary workaround `https://localhost` **and** `https://localhost:5174`
  must each be accepted separately.

Vite proxies `/api/*` requests to `https://<backend-ip>:5174` and **strips** the `/api`
prefix — so `/api/addPage` in the frontend lands on `@router.post("/addPage")` in the backend.
The `@` alias means `main/src/frontend`.

## Folder map

```
main/src/frontend/
  Pages/<PageX>/            page component + its own .scss (Dashboard, Words, AddPage,
                            Landing, Loading, Portfolio) — routes: router/index.ts
  NonPageComponents/        ButtonX (card/button used everywhere), SvgX, Tooltip,
                            ConfirmationPopup, ContextMenu, LiquidGlass, Sparkles
  wordManagement/           model setup + API requests (below)
  stores/appStore.ts        Pinia: initialData, dashboardModel, loadInitialData, loadPages
  directives/tap.ts         @tap / @tap.long directive, thresholds are constants at the top of the file
  junk/                     helpers + scss variables (color-palette, variables)
main/src/backend/
  api/*.py                  one file per endpoint
  jwt_handler.py            verify_app_jwt
  os.py, roles.py, db_util/
pretendServer/project-vocab/   OLD MIRROR — readable, NOT EDITED.
```

## Data model — the most critical point

`pages` table: `(id, user_id, name, description, words jsonb, time_spent_seconds, last_entry_at)`.

**`words` is a single plain text**, stored as a jsonb scalar string:
lines separated by `\n`, word/meaning separator ` | ` (accepted separators: `"\t"`, four spaces, `" | "`).
There are **no** per-word rows, ids or statistics; fields like `marker` are frontend
state only, not persisted.

Parsing happens in one place: `WordManager.instance.setupWords(raw)` →
`main/src/frontend/wordManagement/wordManager.ts:21`. Do not write a new parser, use this one.

Display modes are the `WordMode` enum in `wordManagement/WordMode.ts`
(`SHORT / LONG / MEANING`).

## Backend pattern (binding)

Every `api/*.py` file carries **its own copy** of: the `POSTGRES_*` env reading,
`get_db_connection()`, `auth_required()` (cookie `access_token` → `verify_app_jwt`).
This duplication is intentional; do not extract it into a shared module. New endpoint:

1. `api/<method>_<name>.py` file, same pattern.
2. When writing `words`, pass it to jsonb with `json.dumps(...)` (`post_addNewPageRequest.py:52`).
3. Ownership always lives in the query's `WHERE ... AND user_id = %s` part; if `fetchone()` is empty, `404`.
4. Import in `__main__.py` (`:6-11`) + `include_router` (`:34-39`).

Frontend side: `wordManagement/<name>Request.ts`, following the `addNewPageRequest.ts` pattern — `fetch`,
`Promise<PostRequestResponse>`, does not throw, returns `{ success: false, error }`.

---

# B. Rules

## Working discipline

1. **Authority order**: user instruction > approved rules > this file > existing pattern in
   the code > general convention.
2. **Use the closest existing thing**, do not invent a parallel pattern. Make the smallest change;
   no unrequested refactors.
3. **When in doubt, stop and ask.** If a new architectural decision is needed, present concrete
   options + pros/cons and wait for explicit approval. Silence or acceptance of generated code is
   not approval.
4. **Do not keep a static file map** — it goes stale. The map above is for orientation; for exact
   information discover with Grep/Glob.
5. **Rule status label**: only *Confirmed* is binding; *Observed / Legacy / Pending* are
   notes only.
6. **After a change, check the diff against these rules.**
7. **Long workflow documents are not @imported** — they are read only while doing that work.

## Question discipline

8. **K1 / K2 / K3**
   - K1 (answer is clear from the code or a rule) → do not ask; decide and write it under "Assumptions".
   - K2 (architectural trade-off) → ask; if no answer comes, continue with your own proposal and
     write it under Assumptions.
   - K3 (the user's design/product intent, not derivable from the code) → **never guess, ask.**
9. **Question budget**: at most 4 questions per task. Asking less is better; filling the budget is
   not a goal.
10. **Dedup before asking**: if the question is answered in this file or in mem0
    (`python ~/.claude/mem0/hooks/recall.py "<keywords>"`, read-only), it falls to K1 and is
    not asked.

## Agents / verification

11. **Subagent context isolation**: the contents of subagent reports are not pulled into the main
    session — a subagent returns a decision + at most 3 lines of notes + a file path. The cost is not
    fixed per call, it is cumulative.
12. **Unmeasured is unverified**: looking at code and saying "looks right" is not verification.
    If it was not run, say so.
13. **2-round limit**: at most 2 rounds to fix the same problem; on the third, stop and ask the user.

## Project-specific

14. **Central type/constant file**: enums and threshold constants (`WordMode`, `DOUBLE_CLICK_MS`, tap
    thresholds) are kept in one place, not scattered.
15. **The backend endpoint pattern is binding** (the 4 steps above) — no parallel structure is built.
    In the frontend, communication with a known direct recipient goes via props/emits; no global
    state is added to the store.
16. **English only**: all code comments, docs and identifiers are in English. No Turkish in the
    codebase.
