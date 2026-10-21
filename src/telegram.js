// Тонкая обёртка над Telegram Bot API.
export async function tg(env, method, payload) {
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  const j = await r.json().catch(() => ({ ok: false, description: `HTTP ${r.status}` }));
  if (!j.ok) console.warn(`tg ${method} failed:`, j.description);
  return j;
}

export async function sendDocument(env, chatId, filename, content, caption) {
  const fd = new FormData();
  fd.append('chat_id', String(chatId));
  if (caption) fd.append('caption', caption);
  fd.append('document', new Blob([content], { type: 'text/csv' }), filename);
  const r = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendDocument`, { method: 'POST', body: fd });
  return r.json();
}

// Скачать файл, присланный боту (фото чека), и вернуть base64.
export async function downloadFile(env, fileId) {
  const f = await tg(env, 'getFile', { file_id: fileId });
  if (!f.ok) throw new Error('getFile failed');
  const r = await fetch(`https://api.telegram.org/file/bot${env.BOT_TOKEN}/${f.result.file_path}`);
  const buf = new Uint8Array(await r.arrayBuffer());
  return { base64: toBase64(buf), path: f.result.file_path };
}

export function toBase64(bytes) {
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(s);
}

export const openAppKeyboard = (url, text) => ({
  inline_keyboard: [[{ text, web_app: { url } }]],
});
