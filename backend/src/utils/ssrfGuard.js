import net from 'net';

/**
 * Checks if a parsed IP address belongs to loopback, private, multicast, link-local, or restricted blocks.
 * Supports both IPv4 and IPv6 validation.
 *
 * @param {string} ip - The IP address string.
 * @returns {boolean} True if the IP is private or restricted, false otherwise.
 */
export const isPrivateIP = (ip) => {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);

    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;

    // 10.0.0.0/8 (Private network)
    if (parts[0] === 10) return true;

    // 172.16.0.0/12 (Private network)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

    // 192.168.0.0/16 (Private network)
    if (parts[0] === 192 && parts[1] === 168) return true;

    // 169.254.0.0/16 (Link-local, including Cloud Metadata 169.254.169.254)
    if (parts[0] === 169 && parts[1] === 254) return true;

    // 0.0.0.0/8 (Current network / Broadcast)
    if (parts[0] === 0) return true;

    // 224.0.0.0/4 (Multicast)
    if (parts[0] >= 224 && parts[0] <= 239) return true;

    // 255.255.255.255/32 (Broadcast)
    if (ip === '255.255.255.255') return true;

    return false;
  }

  if (net.isIPv6(ip)) {
    const normalizedIp = ip.toLowerCase().trim();

    // Loopback (::1)
    if (normalizedIp === '::1' || normalizedIp === '0:0:0:0:0:0:0:1') return true;

    // Unspecified / any address (::)
    if (normalizedIp === '::' || normalizedIp === '0:0:0:0:0:0:0:0') return true;

    // Link-local unicast (fe80::/10)
    if (normalizedIp.startsWith('fe80:') || normalizedIp.startsWith('fe9') || normalizedIp.startsWith('fea') || normalizedIp.startsWith('feb')) return true;

    // Unique local address (fc00::/7)
    if (normalizedIp.startsWith('fc') || normalizedIp.startsWith('fd')) return true;

    // Multicast (ff00::/8)
    if (normalizedIp.startsWith('ff')) return true;

    // IPv4-mapped IPv6 (::ffff:0:0/96 or ::ffff:a.b.c.d)
    if (normalizedIp.startsWith('::ffff:')) {
      const ipv4Part = ip.substring(7);
      if (net.isIPv4(ipv4Part)) {
        return isPrivateIP(ipv4Part);
      }
    }

    return false;
  }

  return false;
};

/**
 * Intercepts common hostnames and checks if they map to restricted loopback / local environments.
 *
 * @param {string} hostname - The hostname to inspect.
 * @returns {boolean} True if the hostname is local or restricted.
 */
export const isBlockedTarget = (hostname) => {
  if (!hostname || typeof hostname !== 'string') return true;

  const lowerHostname = hostname.trim().toLowerCase();

  // Common local loopback and cloud metadata strings
  const localHostnames = [
    'localhost',
    'localhost.localdomain',
    'metadata.google.internal', // Google Cloud Metadata
    'instance-data',
    'local',
    '169.254.169.254'           // Cloud Metadata IP
  ];

  if (localHostnames.some(lh => lowerHostname === lh || lowerHostname.endsWith('.' + lh))) {
    return true;
  }

  // If the hostname matches an IP format directly, execute standard IP check
  if (net.isIP(lowerHostname)) {
    return isPrivateIP(lowerHostname);
  }

  return false;
};

export default {
  isPrivateIP,
  isBlockedTarget
};
