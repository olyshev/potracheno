// Проверка подписи Telegram initData: так сервер точно знает, какой пользователь Telegram к нему пришёл.
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
const enc = new TextEncoder();

async function hmac(key, data) {
  const k = await crypto.subtle.importKey('raw', typeof key === 'string' ? enc.encode(key) : key,
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(data)));
}
const hex = (buf) => [...buf].map((b) => b.toString(16).padStart(2, '0')).join('');

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function verifyInitData(initData, botToken, maxAgeSec = 86400) {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;
  params.delete('hash');
  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n');
  const secret = await hmac('WebAppData', botToken);
  const calc = hex(await hmac(secret, dataCheckString));
  if (!timingSafeEqual(calc, hash)) return null;
  const authDate = Number(params.get('auth_date') || 0);
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) return null;
  try {
    const user = JSON.parse(params.get('user') || 'null');
    return user && user.id ? user : null;
  } catch {
    return null;
  }
}

export async function sha256Hex(s) {
  return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s))));
}

// Секрет вебхука выводится из токена бота и ADMIN_KEY — отдельно хранить не нужно.
export async function webhookSecret(env) {
  return (await sha256Hex(`${env.BOT_TOKEN}:${env.ADMIN_KEY}`)).slice(0, 48);
}
