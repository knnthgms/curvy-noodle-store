# Decap CMS — one-time setup

The admin at `/admin` is powered by [Decap CMS](https://decapcms.org).  
It saves content directly to GitHub, so there's no database.  
OAuth is handled by two Cloudflare Pages Functions — no external service needed.

---

## What you need to do once

### 1 — Create a GitHub OAuth App

1. Go to **github.com → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   | Field | Value |
   |---|---|
   | Application name | Curvy Noodle Admin |
   | Homepage URL | `https://curvynoodle.com` (your live domain) |
   | Authorization callback URL | `https://curvynoodle.com/api/callback` |
3. Click **Register application**
4. On the next screen click **Generate a new client secret**
5. Copy the **Client ID** and **Client secret** — you'll need them next

### 2 — Add environment variables in Cloudflare Pages

1. Open the Cloudflare dashboard → Pages → `curvy-noodle-store` → **Settings → Environment variables**
2. Add two variables (for **both** Production and Preview environments):

   | Variable name | Value |
   |---|---|
   | `GITHUB_CLIENT_ID` | *(paste Client ID from step 1)* |
   | `GITHUB_CLIENT_SECRET` | *(paste Client secret from step 1)* |

3. Redeploy the site (push any commit, or use **Manage deployments → Retry**)

### 3 — Done

Visit `https://curvynoodle.com/admin` → click **Login with GitHub** → authorize the app.  
You'll land on the CMS dashboard where you can edit products and blog posts.

---

## How the OAuth flow works

```
Browser                  Cloudflare Pages              GitHub
   │                           │                          │
   │  GET /api/auth             │                          │
   │──────────────────────────>│                          │
   │                           │  redirect to github.com  │
   │<─────────────────────────────────────────────────────│
   │  user clicks Authorize    │                          │
   │─────────────────────────────────────────────────────>│
   │                           │  GET /api/callback?code= │
   │                           │<─────────────────────────│
   │                           │  POST /login/oauth/…     │
   │                           │─────────────────────────>│
   │                           │  { access_token }        │
   │                           │<─────────────────────────│
   │  postMessage(token)       │                          │
   │<─────────────────────────│                          │
   │  CMS loaded with token    │                          │
```

The token is kept in the browser session only — it's never stored server-side.

---

## File map

| File | Purpose |
|---|---|
| `src/pages/admin/index.astro` | Loads Decap CMS from CDN |
| `src/pages/admin/config.yml.ts` | Generates CMS config (reads `SITE_URL` from env) |
| `functions/api/auth.js` | Starts GitHub OAuth flow |
| `functions/api/callback.js` | Exchanges code for token, sends to CMS |

---

## Local development

Decap CMS connects to GitHub, so you can use the live admin against the real repo even locally — just navigate to the deployed URL.  
If you want to test locally without pushing changes to `main`, create a new branch in the GitHub OAuth flow by changing `branch: main` in `config.yml.ts`.
