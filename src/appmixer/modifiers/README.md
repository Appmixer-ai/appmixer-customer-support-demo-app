# Custom Appmixer modifiers — config-as-code

Source of truth for the tenant's **custom modifiers** (`yoursaas_*`). Modifiers
are transform functions applied to variables in the flow editor (click a
variable → Modifier Editor). Appmixer stores them only behind a REST API
(`GET`/`PUT /modifiers`, admin-only, full-replace). This folder keeps them as
real, testable JS and treats the API purely as a deploy target.

> Sibling to the `yoursaas` connector under `src/appmixer/`. Self-contained
> CommonJS sub-package — **not** part of the Vite/TS app build.

## Layout

```
src/                  one modifier = one module (real JS function + metadata)
  formatTicketDate.js
  maskEmail.js
categories.json       custom categories merged into the tenant definition
build.js              fn.toString() -> build/modifiers.json
deploy.js             GET -> backup -> merge (by prefix) -> PUT
test/                 node:test, calls helperFn directly
build/   (gitignored) generated payload
backup/  (gitignored) GET /modifiers snapshot taken before every deploy
```

## Commands

Run from repo root (preferred):

```bash
npm run modifiers:test     # node:test
npm run modifiers:build    # -> build/modifiers.json (inspect serialized helperFn)
npm run modifiers:deploy   # build + GET/backup/merge/PUT  (needs admin token)
```

…or inside this folder: `npm install` then `npm test` / `npm run build` / `npm run deploy`.

## Deploy config (env)

`deploy.js` reads the repo-root `.env` (or the real environment / CI secrets,
which take precedence):

| Variable | Meaning |
|---|---|
| `APPMIXER_API_URL` | API base; defaults to `VITE_APPMIXER_BASE_URL` |
| `APPMIXER_ADMIN_TOKEN` | **admin** Bearer token — env only, never a `VITE_*` var (those ship to the browser) |

Promotion between environments = same `deploy.js`, different
`APPMIXER_API_URL` + `APPMIXER_ADMIN_TOKEN`.

## Constraints (read before writing a modifier)

1. **`helperFn` must be self-contained.** It is serialized with `fn.toString()`
   and runs isolated in the engine — closures and `require()` are lost. Use only
   `value`, your own `arguments`, and the provided `helpers` (e.g.
   `helpers.moment`).
2. **Prefix every key** (`yoursaas_*`) so deploy stays idempotent and never
   clobbers built-in or third-party modifiers.
3. **Guard types / null inside the function.** If `helperFn` throws, the engine
   silently returns the original value — a broken modifier looks like a no-op.
4. **Confirm available `helpers`** for the tenant/version via `GET /modifiers`
   (see what the built-ins use). `moment` is documented; verify anything else.

## Adding a modifier

1. Create `src/<name>.js` exporting `{ key, label, category, description, arguments, returns, helperFn }`.
2. Add a `test/<name>.test.js` calling `helperFn` directly.
3. `npm run modifiers:test && npm run modifiers:build`.
4. `npm run modifiers:deploy`, then confirm it appears in the flow editor.

## Reference

- Customizing modifiers — https://docs.appmixer.com/tutorials/customizing-modifiers
- API: Modifiers — https://docs.appmixer.com/api/modifiers
