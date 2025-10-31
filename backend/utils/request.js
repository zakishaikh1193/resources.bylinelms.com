// Utility to extract the best-possible client IP, even behind proxies
module.exports.getClientIp = function getClientIp(req) {
  try {
    const xff = req.headers['x-forwarded-for'];
    if (xff && typeof xff === 'string') {
      const ip = xff.split(',')[0].trim();
      if (ip) return sanitizeIp(ip);
    }
    const ip =
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection?.socket?.remoteAddress ||
      req.ip || '';
    return sanitizeIp(ip);
  } catch (_) {
    return req.ip || '';
  }
};

function sanitizeIp(ip) {
  // Remove IPv6 prefix if present
  if (ip.startsWith('::ffff:')) return ip.substring(7);
  return ip;
}
