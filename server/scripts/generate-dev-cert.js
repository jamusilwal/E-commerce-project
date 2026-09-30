/**
 * Creates a self-signed TLS certificate for local HTTPS development.
 *
 *   npm run cert:dev
 *
 * Writes <repo>/certs/localhost-key.pem and <repo>/certs/localhost.pem, which
 * both the API (SSL_KEY_PATH / SSL_CERT_PATH) and the Vite dev server use.
 * Browsers show a warning for self-signed certificates; for a trusted local
 * certificate use mkcert instead (see HTTPS_DEPLOYMENT.md) with the same file names.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import selfsigned from 'selfsigned';

const certsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../certs');
const keyFile = path.join(certsDir, 'localhost-key.pem');
const certFile = path.join(certsDir, 'localhost.pem');

if (fs.existsSync(keyFile) && fs.existsSync(certFile) && !process.argv.includes('--force')) {
  console.log(`Certificate already exists in ${certsDir} (use --force to replace it).`);
  process.exit(0);
}

const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
  days: 825,
  keySize: 2048,
  algorithm: 'sha256',
  extensions: [
    { name: 'basicConstraints', cA: false },
    { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
    { name: 'extKeyUsage', serverAuth: true },
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'localhost' },
        { type: 7, ip: '127.0.0.1' },
        { type: 7, ip: '::1' },
      ],
    },
  ],
});

fs.mkdirSync(certsDir, { recursive: true });
fs.writeFileSync(keyFile, pems.private, { mode: 0o600 });
fs.writeFileSync(certFile, pems.cert);

console.log(`✅ Development certificate created:
   ${keyFile}
   ${certFile}

Add to server/.env:
   SSL_KEY_PATH=../certs/localhost-key.pem
   SSL_CERT_PATH=../certs/localhost.pem

Add to client/.env.local:
   VITE_HTTPS=true`);
