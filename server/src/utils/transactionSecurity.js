import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import env from '../config/env.js';

let cachedPrivateKey = null;
let cachedPublicKey = null;
let cachedKeyId = null;

/**
 * Load RSA Key Pair for Transaction Signing & Verification
 */
export const loadSigningKeys = () => {
  if (cachedPrivateKey && cachedPublicKey) {
    return { privateKey: cachedPrivateKey, publicKey: cachedPublicKey, keyId: cachedKeyId };
  }

  let privateKey = null;
  let publicKey = null;
  let keyId = process.env.TRANSACTION_SIGNING_KEY_ID || 'hlb-rsa-2026-v1';

  const defaultKeysDir = path.resolve(process.cwd(), 'keys');
  const defaultPrivatePath = path.join(defaultKeysDir, 'transaction_private.pem');
  const defaultPublicPath = path.join(defaultKeysDir, 'transaction_public.pem');

  const privateKeyPath = process.env.TRANSACTION_SIGNING_PRIVATE_KEY_PATH || defaultPrivatePath;
  const publicKeyPath = process.env.TRANSACTION_SIGNING_PUBLIC_KEY_PATH || defaultPublicPath;

  // 1. Try loading from file paths
  if (fs.existsSync(privateKeyPath)) {
    privateKey = fs.readFileSync(path.resolve(privateKeyPath), 'utf8');
  }
  if (fs.existsSync(publicKeyPath)) {
    publicKey = fs.readFileSync(path.resolve(publicKeyPath), 'utf8');
  }

  // 2. Try loading from direct env vars (PEM or base64)
  if (!privateKey && process.env.TRANSACTION_SIGNING_PRIVATE_KEY) {
    const val = process.env.TRANSACTION_SIGNING_PRIVATE_KEY.trim();
    privateKey = val.startsWith('-----BEGIN') ? val : Buffer.from(val, 'base64').toString('utf8');
  }
  if (!publicKey && process.env.TRANSACTION_SIGNING_PUBLIC_KEY) {
    const val = process.env.TRANSACTION_SIGNING_PUBLIC_KEY.trim();
    publicKey = val.startsWith('-----BEGIN') ? val : Buffer.from(val, 'base64').toString('utf8');
  }

  // 3. Fallback: Auto-generate and persist RSA keypair to disk
  if (!privateKey || !publicKey) {
    if (!fs.existsSync(defaultKeysDir)) {
      fs.mkdirSync(defaultKeysDir, { recursive: true });
    }
    const generated = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    privateKey = generated.privateKey;
    publicKey = generated.publicKey;
    fs.writeFileSync(defaultPrivatePath, privateKey);
    fs.writeFileSync(defaultPublicPath, publicKey);
  }

  cachedPrivateKey = privateKey;
  cachedPublicKey = publicKey;
  cachedKeyId = keyId;

  return { privateKey, publicKey, keyId };
};

/**
 * Generate canonical string representation for payment integrity hashing
 */
export const generateCanonicalTransactionData = ({
  orderId,
  amount,
  method,
  status = 'PENDING',
  transactionId = '',
  paidAt,
}) => {
  const normalizedAmount = Number(amount).toFixed(2);
  const normalizedPaidAt = paidAt instanceof Date ? paidAt.toISOString() : new Date(paidAt || Date.now()).toISOString();
  
  return `orderId=${orderId}|amount=${normalizedAmount}|method=${method}|status=${status || 'PENDING'}|transactionId=${transactionId || ''}|paidAt=${normalizedPaidAt}`;
};

/**
 * Compute SHA-256 hash over canonical transaction data
 */
export const computeTransactionHash = (canonicalData) => {
  return crypto.createHash('sha256').update(canonicalData, 'utf8').digest('hex');
};

/**
 * Sign transaction integrity hash with RSA private key
 */
export const signTransactionHash = (integrityHash) => {
  const { privateKey, keyId } = loadSigningKeys();
  const signer = crypto.createSign('SHA256');
  signer.update(integrityHash);
  signer.end();
  const signature = signer.sign(privateKey, 'base64');
  return { signature, signingKeyId: keyId, signedAt: new Date() };
};

/**
 * Full pipeline: Canonicalize -> Hash -> Sign
 */
export const generateTransactionSecurityData = (paymentParams) => {
  const canonicalData = generateCanonicalTransactionData(paymentParams);
  const integrityHash = computeTransactionHash(canonicalData);
  const { signature, signingKeyId, signedAt } = signTransactionHash(integrityHash);

  return {
    canonicalData,
    integrityHash,
    signature,
    signingKeyId,
    signedAt,
  };
};

/**
 * Verify Transaction Integrity and Digital Signature
 * Compares freshly recomputed hash with stored hash and verifies RSA signature.
 */
export const verifyTransactionSignature = (paymentRecord, dataOverride = null) => {
  try {
    const { publicKey } = loadSigningKeys();
    
    // Allow passing modified/tampered data for testing integrity failures
    const targetData = dataOverride || paymentRecord;
    
    const canonicalData = generateCanonicalTransactionData({
      orderId: targetData.orderId,
      amount: targetData.amount,
      method: targetData.method,
      status: targetData.status,
      transactionId: targetData.transactionId,
      paidAt: targetData.paidAt,
    });

    const recomputedHash = computeTransactionHash(canonicalData);
    const hashMatches = recomputedHash === paymentRecord.integrityHash;

    if (!paymentRecord.signature) {
      return {
        valid: false,
        error: 'Missing transaction digital signature',
        hashMatches,
        recomputedHash,
        storedHash: paymentRecord.integrityHash,
      };
    }

    // Verify RSA signature against the integrity hash
    const verifier = crypto.createVerify('SHA256');
    verifier.update(recomputedHash);
    verifier.end();
    const isSignatureValid = verifier.verify(publicKey, paymentRecord.signature, 'base64');

    const isValid = hashMatches && isSignatureValid;

    return {
      valid: isValid,
      hashValid: hashMatches,
      signatureValid: isSignatureValid,
      recomputedHash,
      storedHash: paymentRecord.integrityHash,
      canonicalData,
      signingKeyId: paymentRecord.signingKeyId,
      signedAt: paymentRecord.signedAt,
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
};
