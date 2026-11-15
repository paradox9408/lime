// 라임 알림 서버 — 라임 API(Apps Script)가 보낸 요청을 받아 아이폰으로 웹 푸시를 보냄
const webpush = require('web-push');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (!b || !process.env.PUSH_SECRET || b.secret !== process.env.PUSH_SECRET) return res.status(401).json({ ok: false });
  webpush.setVapidDetails('https://limeport.vercel.app', process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);
  const msg = JSON.stringify(b.msg || {});
  const r = await Promise.all((b.subs || []).map(s =>
    webpush.sendNotification(s, msg, { TTL: 86400, urgency: 'normal' }).then(() => 201).catch(e => e.statusCode || 500)));
  res.status(200).json({ ok: true, r });
};
