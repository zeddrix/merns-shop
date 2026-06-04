# Deployment: MongoDB Atlas M0 + Render (Mern's Shop)

Complete **full modernization** and **ISSUE-015 repo rename** (`merns-shop`) before Part C.

---

## Part A — MongoDB Atlas M0

1. Confirm M0 cluster exists (database name **`merns-shop`**).
2. **Database Access** → create user → save password securely.
3. **Network Access** → allow `0.0.0.0/0` for starter (tighten to Render egress later).
4. Build production URI:

```text
mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/merns-shop?retryWrites=true&w=majority
```

5. Test connection:

```bash
pnpm db:ping:atlas
# Requires MONGO_URI in .env pointing at Atlas
```

6. Seed production once (from a trusted machine):

```bash
MONGO_URI="mongodb+srv://..." JWT_SECRET="prod-secret" pnpm db:seed:prod
```

Default seeded admin: `admin@gmail.com` / `123456` — **change immediately in production**.

---

## Part B — PayPal

| Environment                 | `PAYPAL_CLIENT_ID`                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Staging / dev               | Sandbox Client ID from [PayPal Developer Dashboard](https://developer.paypal.com/) |
| Production (optional later) | Live app Client ID — separate PayPal live app                                      |

E2E uses sandbox buyer credentials in `.env.test` only (`PAYPAL_SANDBOX_BUYER_EMAIL`, `PAYPAL_SANDBOX_BUYER_PASSWORD`).

---

## Part C — Render free web service (after GitHub rename)

1. GitHub → rename repo to **`merns-shop`** (ISSUE-015).
2. Render → **New Web Service** → connect **`merns-shop`** repo.
3. **Build command:** `pnpm install && pnpm build` (compiles frontend to `frontend/dist` and backend to `dist/backend/`)
4. **Start command:** `pnpm start` (runs `node dist/backend/server.js` from repo root)
5. **Instance type:** Free
6. Environment variables:

| Key                | Value                                 |
| ------------------ | ------------------------------------- |
| `NODE_ENV`         | `production`                          |
| `JWT_SECRET`       | Strong random secret                  |
| `MONGO_URI`        | Atlas URI with `/merns-shop` database |
| `PAYPAL_CLIENT_ID` | Sandbox or live Client ID             |

7. Deploy → open `https://<service>.onrender.com`
8. **Cold start:** free tier sleeps after ~15 min idle; first request may take 30–60s.
9. **Post-deploy smoke:** homepage shows **MERN's Shop**, login, admin product list, checkout to order screen.
10. **Product images:** Bundled under `frontend/public/images` and served from `frontend/dist/images` after `pnpm build` — redeploy-safe (no disk uploads).

Optional: use [`render.yaml`](../render.yaml) Blueprint at repo root.

---

## Part D — Local vs production env map

| Variable           | `.env` / `.env.test` (local)           | Render (production)                      |
| ------------------ | -------------------------------------- | ---------------------------------------- |
| `MONGO_URI`        | `mongodb://127.0.0.1:27017/merns-shop` | Atlas `mongodb+srv://.../merns-shop?...` |
| `JWT_SECRET`       | dev secret                             | prod secret                              |
| `PAYPAL_CLIENT_ID` | sandbox                                | sandbox or live                          |
| PayPal buyer creds | `.env.test` only                       | N/A                                      |

Local MongoDB:

```bash
docker compose up -d mongo
pnpm db:seed
```

---

## Part E — Troubleshooting

| Symptom                      | Fix                                                                                                                      |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Atlas connection timeout     | Check Network Access IP allowlist; verify URI encoding for special chars in password                                     |
| Render build fails on `pnpm` | Ensure `pnpm-workspace.yaml` committed; Node 22 in Render settings                                                       |
| Render start fails           | Run from repo root; confirm `dist/backend/server.js` exists after `pnpm build`                                           |
| Blank page in production     | Confirm `pnpm build` outputs `frontend/dist`; Express serves `frontend/dist`                                             |
| PayPal buttons missing       | Set `PAYPAL_CLIENT_ID` on Render; check browser console for SDK errors                                                   |
| 401 on admin routes          | Re-login; verify `JWT_SECRET` unchanged between deploys                                                                  |
| Broken product images        | Run `pnpm catalog:images` then `pnpm catalog:validate`; re-seed with `pnpm db:seed:prod` after deploy if catalog changed |

---

## ISSUE-015 — Repo rename checklist

1. On **Node 22**, run the full pre-deploy gate: `pnpm verify:full` (format, quality, unit, integration, build, E2E)
2. GitHub → Settings → rename **`beamazedd-shop`** → **`merns-shop`**
3. Local: `git remote set-url origin git@github.com:zeddrix/merns-shop.git`
4. Optionally rename local folder to `merns-shop`
5. Render → connect renamed repo → redeploy (build + `pnpm start` as in Part C)
6. Post-deploy smoke: homepage header/footer show **MERN's Shop**, login works, admin product list loads, checkout reaches order screen
