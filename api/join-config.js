module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  const {TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY, GROUPME_INVITE_URL} = process.env;
  if (!TURNSTILE_SITE_KEY || !TURNSTILE_SECRET_KEY || !GROUPME_INVITE_URL) return res.status(503).json({error: 'Joining is being set up. Please check back soon.'});
  return res.status(200).json({siteKey: TURNSTILE_SITE_KEY});
};
