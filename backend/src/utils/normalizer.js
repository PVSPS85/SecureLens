import { URL } from 'url';

/**
 * Normalizes and extracts URL/target subcomponents safely.
 * Lowercases hostnames and automatically handles IDN (Punycode) conversions.
 *
 * @param {string} target - The untrusted target URL, domain, or IP.
 * @returns {object} The normalized components.
 */
export const normalizeTarget = (target) => {
  if (!target || typeof target !== 'string') {
    throw new Error('Target must be a non-empty string.');
  }

  const cleanedTarget = target.trim();
  let parsedUrl;
  
  // Detect if target has a protocol/scheme (e.g., http://, https://, ftp://)
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(cleanedTarget);
  
  // If it has no scheme, we prepend http:// temporarily to parse components safely
  const urlToParse = hasScheme ? cleanedTarget : `http://${cleanedTarget}`;

  try {
    parsedUrl = new URL(urlToParse);
  } catch (error) {
    throw new Error('Malformed target URL or invalid destination.');
  }

  const scheme = hasScheme ? parsedUrl.protocol.replace(':', '').toLowerCase() : null;
  let hostname = parsedUrl.hostname;
  const port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : null;
  const path = parsedUrl.pathname;
  const query = parsedUrl.search;

  // Modern URL API automatically converts IDN hostnames (e.g., übersetzung.de) to Punycode (e.g., xn--bersetzung-lfb.de)
  hostname = hostname.toLowerCase();

  // Strip brackets from IPv6 hostnames for uniform storage/display if needed
  let displayHostname = hostname;
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    displayHostname = hostname.slice(1, -1);
  }

  return {
    original: target,
    scheme,
    hostname: displayHostname,
    port,
    path: path || '/',
    query: query || '',
    normalizedUrl: hasScheme
      ? `${parsedUrl.protocol}//${hostname}${parsedUrl.port ? `:${parsedUrl.port}` : ''}${path}${query}`
      : `${hostname}${parsedUrl.port ? `:${parsedUrl.port}` : ''}${path}${query}`
  };
};

export default {
  normalizeTarget
};
