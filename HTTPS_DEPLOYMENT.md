# HTTPS & TLS Production Deployment Guide — HAMROLOK BAZAR

This document outlines the security architecture, TLS termination strategy, and environment configuration required for deploying **HAMROLOK BAZAR** securely in production environments.

---

## 1. TLS/SSL Architecture Overview

In modern production deployments, TLS termination is handled at the edge (Reverse Proxy, Ingress Controller, Cloud Load Balancer, or PaaS provider) rather than having the Node.js application manage raw SSL certificate files directly.

```
[ Client Browser ] 
       │ HTTPS (Port 443 / TLS 1.3)
       ▼
[ Cloudflare / AWS ALB / NGINX / Caddy / Vercel / Render ]
       │ HTTP (Internal Private Network / VPC)
       ▼
[ HAMROLOK BAZAR Node.js API (Port 5001) ]
```

### Why Edge TLS Termination?
- **Automated Certificate Lifecycle**: Automatic zero-downtime certificate renewal via Let's Encrypt / ACME or Cloudflare Universal SSL.
- **Hardware Acceleration**: Optimized cryptographic handshakes and ALPN (HTTP/2 and HTTP/3 support).
- **DDoS and Layer 7 Protection**: Rate limiting, WAF (Web Application Firewall), and bot mitigation before traffic hits the application process.
- **Microservice Scalability**: Allows horizontal scaling of backend Node.js worker containers without managing per-instance certificate files.

---

## 2. Server-Side Security Configurations

### A. Environment Variables (`.env`)
In production, set the following environment variables:
```env
NODE_ENV=production
PORT=5001
CLIENT_URL=https://hamrolokbazar.com
```

### B. HTTP Strict Transport Security (HSTS) & Security Headers
The server utilizes `helmet` in `server/src/app.js` with default HSTS enabled in production:
```javascript
// Strict-Transport-Security enforced automatically in production:
app.use(helmet({
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
}));
```

### C. Secure `httpOnly` Cookies
Refresh tokens are transmitted via `httpOnly` cookies with strict security flags:
```javascript
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

### D. CORS Restrictions
In production, CORS is locked down to the explicit HTTPS domain:
```javascript
cors({
  origin: process.env.CLIENT_URL, // e.g. https://hamrolokbazar.com
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
})
```

---

## 3. Reverse Proxy Configuration Examples

### NGINX (with Let's Encrypt / Certbot)
```nginx
server {
    listen 80;
    server_name api.hamrolokbazar.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.hamrolokbazar.com;

    ssl_certificate /etc/letsencrypt/live/api.hamrolokbazar.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.hamrolokbazar.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Caddy Server
```caddy
api.hamrolokbazar.com {
    reverse_proxy localhost:5001
}
```

---

## 4. Production Checklist

- [x] Reverse Proxy / Cloud Provider TLS 1.3 configured.
- [x] `NODE_ENV=production` set on server.
- [x] `CLIENT_URL` uses `https://` prefix.
- [x] Database connections use TLS (`sslmode=require` in `DATABASE_URL` for PostgreSQL).
- [x] Cookies flagged with `Secure` and `HttpOnly`.
- [x] Helmet HSTS header active (`maxAge: 31536000`).
- [x] Transaction security signing keys loaded from protected environment variables.
