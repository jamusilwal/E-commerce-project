import dns from 'dns';

// Common disposable / temporary email providers to prevent fake signups
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'yopmail.com',
  'sharklasers.com',
  'throwawaymail.com',
  'trashmail.com',
  'getairmail.com',
  'fakemailgenerator.com',
  'dispostable.com',
  'mohmal.com',
  'burnermail.io',
  'crazymailing.com',
  'temp-mail.org',
  'temp-mail.io',
  'mytemp.email',
  'generator.email',
  'nada.ltd',
  'dropmail.me',
]);

// Strict RFC 5322 regex ensuring valid username, domain, and 2+ char TLD
const STRICT_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validate email format and check for disposable domains
 * @param {string} email
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateEmailSyntax = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required' };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email address exceeds maximum allowed length' };
  }

  if (!STRICT_EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email format (e.g. name@example.com)' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email structure' };
  }

  const domain = parts[1];
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return { isValid: false, error: 'Email must have a valid top-level domain (e.g. .com, .np, .edu)' };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: 'Disposable / temporary email addresses are not allowed. Please use a permanent email address to receive order updates.',
    };
  }

  return { isValid: true };
};

/**
 * Validate that an email domain has active Mail Exchange (MX) DNS records
 * Times out after timeoutMs to prevent hanging requests in restricted environments.
 * @param {string} email
 * @param {number} timeoutMs
 * @returns {Promise<{ isValid: boolean, error?: string }>}
 */
export const validateEmailDomainMx = async (email, timeoutMs = 2500) => {
  const syntaxCheck = validateEmailSyntax(email);
  if (!syntaxCheck.isValid) {
    return syntaxCheck;
  }

  const domain = email.trim().toLowerCase().split('@')[1];

  try {
    const mxRecordsPromise = dns.promises.resolveMx(domain);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DNS_TIMEOUT')), timeoutMs)
    );

    const mxRecords = await Promise.race([mxRecordsPromise, timeoutPromise]);

    if (!mxRecords || mxRecords.length === 0) {
      // Fallback check: Some valid domains only define an A record for mail
      try {
        const aRecords = await dns.promises.resolve4(domain);
        if (!aRecords || aRecords.length === 0) {
          return {
            isValid: false,
            error: `The email domain "${domain}" does not have active mail servers. Please provide an active email address.`,
          };
        }
      } catch {
        return {
          isValid: false,
          error: `The email domain "${domain}" does not have active mail servers. Please provide an active email address.`,
        };
      }
    }

    return { isValid: true };
  } catch (err) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA' || err.code === 'NXDOMAIN') {
      return {
        isValid: false,
        error: `The domain "${domain}" does not exist. Please check your email spelling.`,
      };
    }

    // In case of timeout or local network connectivity limits, allow graceful fallback
    if (err.message === 'DNS_TIMEOUT' || err.code === 'ECONNREFUSED' || err.code === 'SERVFAIL') {
      console.warn(`[emailValidator] DNS check bypassed for ${domain} (${err.message || err.code})`);
      return { isValid: true };
    }

    return { isValid: true };
  }
};
