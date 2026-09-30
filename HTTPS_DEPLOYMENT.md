# HTTPS & TLS Guide — HAMROLOK BAZAR

HAMROLOK BAZAR supports HTTPS in three setups. Pick the one that matches where the app runs.

| Setup | Who handles TLS | What to set |
|---|---|---|
| **A. Local development over HTTPS** | Node + Vite, with a local certificate | `SSL_KEY_PATH`, `SSL_CERT_PATH`, `VITE_HTTPS` |
| **B. Production behind a proxy / host** (recommended) | Nginx, Caddy, Render, Railway, Cloudflare… | `NODE_ENV=production`, `CLIENT_URL=https://…` |
| **C. Production on a VPS without a proxy** | Node itself, with a real certificate | `SSL_KEY_PATH`, `SSL_CERT_PATH`, `PORT=443`, `HTTP_REDIRECT_PORT=80` |

All settings live in `server/.env` (see `server/.env.example`) and `client/.env.local` (see `client/.env.example`).

---

## What the server does

| Protection | Where | Default |
|---|---|---|
| Serves HTTPS directly when a certificate is configured (TLS 1.2+ only) | `server/src/server.js` | off until `SSL_KEY_PATH` + `SSL_CERT_PATH` are set |
| Optional HTTP port that 308-redirects to HTTPS | `server/src/server.js` | off until `HTTP_REDIRECT_PORT` is set |
| Trusts the proxy's `X-Forwarded-Proto` so it knows the visitor used HTTPS | `TRUST_PROXY` | `1` in production |
| Redirects `http://` GET requests to `https://` and refuses other `http://` requests with 403 (`/api/health` stays open for load-balancer checks) | `enforceHttps` in `server/src/config/security.js` | on in production |
| `Strict-Transport-Security: max-age=31536000; includeSubDomains` | `securityHeaders` (helmet) | on in production |
| CORS only for your frontend (`CLIENT_URL` / `CLIENT_URLS`); localhost is allowed only outside production | `corsOptions` | always |
| Refresh-token cookie is `HttpOnly`, `Secure` and `SameSite` | `refreshCookieOptions` | `Secure` + `SameSite=Strict` in production |

The frontend calls the API at `/api` on its own origin by default, so it always uses the same protocol as the page. If `VITE_API_URL` points at another host with `http://` while the page is on HTTPS, the client upgrades it to `https://` (browsers would block it otherwise).

---

## A. Local development over HTTPS

1. **Create a certificate** (from the `server` folder):

   ```bash
   npm run cert:dev
   ```

   This writes `certs/localhost-key.pem` and `certs/localhost.pem` in the project root. The `certs/` folder is git-ignored.

   > The browser will warn about a self-signed certificate once — choose *Advanced → Proceed*.
   > For a certificate the browser trusts with no warning, install [mkcert](https://github.com/FiloSottile/mkcert) and run, from the project root:
   >
   > ```bash
   > mkcert -install
   > mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1 ::1
   > ```
   >
   > (On Windows: `choco install mkcert` or `winget install FiloSottile.mkcert`.)

2. **Turn on HTTPS for the API** — add to `server/.env`:

   ```env
   SSL_KEY_PATH=../certs/localhost-key.pem
   SSL_CERT_PATH=../certs/localhost.pem
   CLIENT_URL=https://localhost:5173
   ```

3. **Turn on HTTPS for the frontend** — create `client/.env.local`:

   ```env
   VITE_HTTPS=true
   VITE_PROXY_TARGET=https://localhost:5001
   ```

4. Restart both (`npm run dev` in `server` and `client`) and open **https://localhost:5173**.

To go back to plain HTTP, remove those lines and restart.

---

## B. Production behind a proxy or hosting platform (recommended)

TLS ends at the proxy; Node runs plain HTTP on a private port. Certificates renew automatically (Let's Encrypt / the platform).

```
Browser ──HTTPS──▶ Nginx / Caddy / Render / Cloudflare ──HTTP (private)──▶ Node API :5001
```

**`server/.env`**

```env
NODE_ENV=production
PORT=5001
CLIENT_URL=https://hamrolokbazar.com
# If the site is also served on www:
# CLIENT_URLS=https://hamrolokbazar.com,https://www.hamrolokbazar.com
DATABASE_URL="postgresql://…?sslmode=require"
```

`TRUST_PROXY`, `FORCE_HTTPS` and `HSTS_ENABLED` switch on automatically with `NODE_ENV=production`.

**Frontend and API on different sites?** (e.g. `*.vercel.app` + `*.onrender.com`) Browsers only send the login cookie across sites with `SameSite=None`:

```env
COOKIE_SAME_SITE=none
```

When they share a domain (`hamrolokbazar.com` + `api.hamrolokbazar.com`) keep the default `strict`.

**Frontend (Vercel)** — set the environment variable `VITE_API_URL=https://api.hamrolokbazar.com/api`. `client/vercel.json` adds HSTS and other security headers to every page.

### Nginx (with Let's Encrypt / Certbot)

```nginx
server {
    listen 80;
    server_name api.hamrolokbazar.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.hamrolokbazar.com;

    ssl_certificate     /etc/letsencrypt/live/api.hamrolokbazar.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.hamrolokbazar.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Get the certificate with `sudo certbot --nginx -d api.hamrolokbazar.com`.

### Caddy (automatic certificates)

```caddy
api.hamrolokbazar.com {
    reverse_proxy 127.0.0.1:5001
}
```

---

## C. Production on a VPS without a proxy

Node serves HTTPS itself. Get a certificate with Certbot (`sudo certbot certonly --standalone -d api.hamrolokbazar.com`), then:

```env
NODE_ENV=production
PORT=443
HTTP_REDIRECT_PORT=80
SSL_KEY_PATH=/etc/letsencrypt/live/api.hamrolokbazar.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/api.hamrolokbazar.com/fullchain.pem
TRUST_PROXY=false
CLIENT_URL=https://hamrolokbazar.com
```

Restart the server after each certificate renewal (e.g. a Certbot `--deploy-hook`). Setup B is easier to maintain.

---

## Production checklist

- [ ] Site and API open on `https://` and `http://` redirects to `https://`
- [ ] `NODE_ENV=production` on the server
- [ ] `CLIENT_URL` (and `VITE_API_URL`) use `https://`
- [ ] `COOKIE_SAME_SITE=none` if frontend and API are on different sites
- [ ] `DATABASE_URL` ends with `sslmode=require` for a hosted database
- [ ] Response headers include `Strict-Transport-Security` (check with `curl -I https://api.hamrolokbazar.com/api/health`)
- [ ] Only enable `HSTS_PRELOAD=true` once every subdomain is permanently HTTPS
- [ ] Secrets (`JWT_*`, payment keys, `SMTP_PASS`) are set on the server, never committed
