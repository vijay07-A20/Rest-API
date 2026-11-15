/**
 * Network Layer Utility: IP Resolution and Privacy-Conscious Masking
 * Supports IPv4 (32-bit dotted-decimal) and IPv6 (128-bit hexadecimal).
 * Integrates Computer Networks concepts: Subnetting, CIDR, Loopback, Private Address Blocks (RFC 1918).
 */

export function extractClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  let rawIp = forwarded ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || req.ip || '127.0.0.1');

  // Strip IPv6-mapped IPv4 prefix (e.g., ::ffff:192.168.1.1)
  if (rawIp.startsWith('::ffff:')) {
    rawIp = rawIp.substring(7);
  }

  // Handle standard localhost IPv6 notation
  if (rawIp === '::1') {
    rawIp = '127.0.0.1';
  }

  return rawIp;
}

export function detectIpVersion(ip) {
  if (!ip) return 'IPv4';
  if (ip.includes(':')) return 'IPv6';
  return 'IPv4';
}

export function maskIpAddress(ip) {
  if (!ip) return '0.0.0.xxx';

  const version = detectIpVersion(ip);

  if (version === 'IPv4') {
    const octets = ip.split('.');
    if (octets.length === 4) {
      return `${octets[0]}.${octets[1]}.${octets[2]}.xxx`;
    }
    return ip.replace(/\.\d+$/, '.xxx');
  } else {
    // IPv6 masking: preserve first 3 hextets for geographic/ISP identification, mask interface identifier
    const hextets = ip.split(':');
    if (hextets.length >= 4) {
      return `${hextets[0]}:${hextets[1]}:${hextets[2]}::xxxx`;
    }
    return '2001:db8::xxxx';
  }
}

export function classifyNetworkScope(ip) {
  if (!ip || ip === '127.0.0.1' || ip === 'localhost') return 'Loopback (Host Internal)';
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) {
    return 'Private Network (RFC 1918)';
  }
  if (ip.startsWith('100.64.')) return 'Carrier-Grade NAT (RFC 6598)';
  if (ip.startsWith('fe80:')) return 'IPv6 Link-Local';
  return 'Public Internet';
}
