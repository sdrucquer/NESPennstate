module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return res.status(415).json({error: 'Please use the join form.'});
  const {TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY, GROUPME_INVITE_URL} = process.env;
  if (!TURNSTILE_SITE_KEY || !TURNSTILE_SECRET_KEY || !GROUPME_INVITE_URL) return res.status(503).json({error: 'Joining is being set up. Please check back soon.'});
  let data;
  try { data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return res.status(400).json({error: 'Please use the join form.'}); }
  if (!data || JSON.stringify(data).length > 8192) return res.status(400).json({error: 'Please use the join form.'});
  const {name, email, token, website} = data;
  if (website || typeof name !== 'string' || name.trim().length < 2 || name.length > 80 || typeof email !== 'string' || email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@psu\.edu$/i.test(email.trim())) return res.status(400).json({error: 'Enter your name and a Penn State email ending in @psu.edu.'});
  if (typeof token !== 'string' || !token || token.length > 2048) return res.status(400).json({error: 'Complete the bot check and try again.'});
  const origin = req.headers.origin;
  const allowed = new Set(['nespennstate.com', 'www.nespennstate.com']);
  if (process.env.VERCEL_URL) allowed.add(process.env.VERCEL_URL);
  try { if (!origin || !allowed.has(new URL(origin).hostname)) return res.status(403).json({error: 'Please join through the NES website.'}); } catch { return res.status(403).json({error: 'Please join through the NES website.'}); }
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({secret: TURNSTILE_SECRET_KEY, response: token}), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('Verification unavailable');
    const check = await response.json();
    if (!check.success || check.action !== 'nes_join' || !allowed.has(check.hostname)) return res.status(403).json({error: 'The bot check expired or failed. Please try again.'});
    const invite = new URL(GROUPME_INVITE_URL);
    if (invite.protocol !== 'https:' || invite.hostname !== 'groupme.com' || !invite.pathname.startsWith('/join_group/')) throw new Error('Invite configuration invalid');
    return res.status(200).json({inviteUrl: invite.href});
  } catch {
    return res.status(503).json({error: 'The bot check is temporarily unavailable. Please try again shortly.'});
  }
};
