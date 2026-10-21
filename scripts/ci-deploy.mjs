// Публикация из GitHub Actions: база → миграции → приложение → ключи → подключение бота.
// Всё идемпотентно: можно запускать сколько угодно раз.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';

const DB_NAME = 'potracheno';
const need = ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'BOT_TOKEN', 'ANTHROPIC_API_KEY'];
const missing = need.filter((k) => !process.env[k]);
if (missing.length === need.length) {
  console.log('::warning::Секреты для публикации ещё не добавлены — пропускаю. Добавьте их в Settings → Secrets and variables → Actions.');
  process.exit(0);
}
if (missing.length) fail(`В настройках репозитория (Settings → Secrets and variables → Actions) не хватает секретов: ${missing.join(', ')}`);

// Ошибки дублируются аннотацией GitHub (::error::) — их видно на странице запуска и через API
const annotate = (msg) => console.log(`::error::${String(msg).slice(-3000).replace(/%/g, '%25').replace(/\r/g, '').replace(/\n/g, '%0A')}`);
function fail(msg) { console.error(`\n✘ ${msg}\n`); annotate(msg); process.exit(1); }
process.on('uncaughtException', (e) => fail(`${e.message}\n${e.stdout || ''}\n${e.stderr || ''}`));
process.on('unhandledRejection', (e) => fail(`${e && e.message}\n${(e && e.stdout) || ''}\n${(e && e.stderr) || ''}`));
function wrangler(args, { input, quiet } = {}) {
  try {
    return execFileSync('npx', ['wrangler', ...args], {
      encoding: 'utf8', input, env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' },
      stdio: ['pipe', 'pipe', quiet ? 'pipe' : 'inherit'],
    });
  } catch (e) {
    const out = `${e.stdout || ''}\n${e.stderr || ''}`;
    if (/workers\.dev subdomain/i.test(out)) {
      fail('У аккаунта Cloudflare ещё нет адреса *.workers.dev. Откройте в панели Cloudflare раздел Workers & Pages один раз — адрес создастся автоматически, — затем перезапустите публикацию.');
    }
    if (/Authentication error|10000|not authorized|code: 9109/i.test(out)) {
      fail('Cloudflare не принял токен. Проверьте, что у токена есть права Workers Scripts: Edit и D1: Edit для вашего аккаунта, и что CLOUDFLARE_ACCOUNT_ID верный.');
    }
    process.stdout.write(out);
    fail(`wrangler ${args.join(' ')} завершился с ошибкой:\n${out}`);
  }
}
const step = (t) => console.log(`\n▶ ${t}`);

// 1. База: находим или создаём
step('База данных');
let dbId;
const listOut = wrangler(['d1', 'list', '--json'], { quiet: true }) || '[]';
const list = JSON.parse(listOut.slice(Math.max(0, listOut.indexOf('['))));
const existing = list.find((d) => d.name === DB_NAME);
if (existing) {
  dbId = existing.uuid;
  console.log(`есть: ${dbId}`);
} else {
  const out = wrangler(['d1', 'create', DB_NAME], { quiet: true });
  dbId = (out.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/) || [])[0];
  if (!dbId) fail(`Не удалось создать базу:\n${out}`);
  console.log(`создана: ${dbId}`);
}
const toml = readFileSync('wrangler.toml', 'utf8');
writeFileSync('wrangler.toml', toml.replace(/database_id = "[^"]*"/, `database_id = "${dbId}"`));

// 2. Миграции
step('Обновление структуры базы');
wrangler(['d1', 'migrations', 'apply', DB_NAME, '--remote']);

// 3. Приложение
step('Публикация приложения');
const dep = wrangler(['deploy'], { quiet: true });
process.stdout.write(dep);
const url = (dep.match(/https:\/\/[a-z0-9.-]+\.workers\.dev/) || [])[0];
if (!url) fail('Не нашёл адрес приложения в выводе выше.');

// 4. Ключи (ADMIN_KEY выводится из токена бота — отдельно хранить не нужно)
step('Ключи');
const adminKey = createHash('sha256').update(`${process.env.BOT_TOKEN}:potracheno-admin`).digest('hex').slice(0, 32);
const secretsFile = '.secrets.json';
writeFileSync(secretsFile, JSON.stringify({
  BOT_TOKEN: process.env.BOT_TOKEN,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ADMIN_KEY: adminKey,
}));
try { wrangler(['secret', 'bulk', secretsFile]); } finally { unlinkSync(secretsFile); }

// 5. Бот: вебхук, кнопка меню, команды
step('Подключение бота');
let res;
for (let i = 0; i < 8; i++) {
  await new Promise((r) => setTimeout(r, 5000)); // новые ключи применяются за несколько секунд
  res = await fetch(`${url}/admin/setup?key=${adminKey}`).then((r) => r.json()).catch((e) => ({ ok: false, error: e.message }));
  if (res.ok) break;
}
// Приложение уже опубликовано; сбой здесь обычно временный на стороне Telegram — предупреждаем, но не валим публикацию
if (!res.ok) console.log(`::warning::Бот не переподключился (приложение опубликовано, следующая публикация попробует снова): ${JSON.stringify(res).slice(0, 400)}`);

console.log(`\n✔ Готово: ${url}`);
