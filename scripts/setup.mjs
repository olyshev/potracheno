// Установка «в одну команду»: npm run setup
// Создаёт базу в Cloudflare, публикует приложение, сохраняет ключи и подключает бота.
import { execSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import readline from 'node:readline/promises';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const run = (cmd, opts = {}) => execSync(cmd, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'], ...opts });
const step = (n, text) => console.log(`\n\x1b[1m${n}. ${text}\x1b[0m`);

async function main() {
  step(1, 'Вход в Cloudflare');
  let who = '';
  try { who = run('npx wrangler whoami'); } catch { /* не залогинен */ }
  if (!/associated with the email|You are logged in/i.test(who)) {
    console.log('Откроется браузер — войдите в аккаунт Cloudflare и нажмите Allow.');
    spawnSync('npx', ['wrangler', 'login'], { stdio: 'inherit', shell: true });
  } else console.log('Уже вошли.');

  step(2, 'База данных');
  let toml = readFileSync('wrangler.toml', 'utf8');
  if (toml.includes('REPLACE_WITH_DATABASE_ID')) {
    const out = run('npx wrangler d1 create potracheno');
    const id = (out.match(/database_id\s*=\s*"([0-9a-f-]{36})"/) || out.match(/"database_id":\s*"([0-9a-f-]{36})"/) || [])[1];
    if (!id) { console.log(out); throw new Error('Не удалось получить id базы — пришлите этот вывод Claude.'); }
    toml = toml.replace('REPLACE_WITH_DATABASE_ID', id);
    writeFileSync('wrangler.toml', toml);
    console.log(`Создана база ${id}`);
  } else console.log('База уже создана.');
  spawnSync('npx', ['wrangler', 'd1', 'migrations', 'apply', 'potracheno', '--remote'], { stdio: 'inherit', shell: true, env: { ...process.env, CI: 'true' } });

  step(3, 'Публикация приложения');
  const dep = spawnSync('npx', ['wrangler', 'deploy'], { encoding: 'utf8', shell: true });
  process.stdout.write(dep.stdout || ''); process.stderr.write(dep.stderr || '');
  const url = ((dep.stdout || '').match(/https:\/\/[a-z0-9.-]+\.workers\.dev/) || [])[0];
  if (!url) throw new Error('Не нашёл адрес приложения в выводе выше.');
  console.log(`Адрес приложения: ${url}`);

  step(4, 'Ключи');
  const putSecret = (name, value) => {
    const r = spawnSync('npx', ['wrangler', 'secret', 'put', name], { input: value, encoding: 'utf8', shell: true });
    if (r.status !== 0) { console.log(r.stdout, r.stderr); throw new Error(`Не удалось сохранить ${name}`); }
    console.log(`✓ ${name} сохранён`);
  };
  const botToken = (await rl.question('Токен бота от @BotFather (вида 123456:ABC...): ')).trim();
  if (!/^\d+:[\w-]{30,}$/.test(botToken)) throw new Error('Это не похоже на токен бота.');
  putSecret('BOT_TOKEN', botToken);
  const aiKey = (await rl.question('Ключ Anthropic API (начинается с sk-ant-): ')).trim();
  if (!aiKey.startsWith('sk-ant-')) throw new Error('Это не похоже на ключ Anthropic.');
  putSecret('ANTHROPIC_API_KEY', aiKey);
  let adminKey = existsSync('.admin-key') ? readFileSync('.admin-key', 'utf8').trim() : '';
  if (!adminKey) { adminKey = randomBytes(18).toString('base64url'); writeFileSync('.admin-key', adminKey); }
  putSecret('ADMIN_KEY', adminKey);

  step(5, 'Подключение бота');
  await new Promise((r) => setTimeout(r, 4000)); // ключи применяются за пару секунд
  const res = await fetch(`${url}/admin/setup?key=${encodeURIComponent(adminKey)}`).then((r) => r.json()).catch((e) => ({ ok: false, error: e.message }));
  if (!res.ok) { console.log(JSON.stringify(res, null, 2)); throw new Error('Бот не подключился — пришлите вывод выше Claude.'); }
  console.log('✓ Бот подключён, кнопка меню настроена.');

  console.log(`\n\x1b[32m\x1b[1mГотово!\x1b[0m Откройте своего бота в Telegram и нажмите /start.`);
  console.log(`Статистика для вас: ${url}/admin/stats?key=${adminKey}`);
  console.log('Ключ администратора сохранён в файле .admin-key — никому его не показывайте.');
  rl.close();
}

main().catch((e) => { console.error(`\n\x1b[31m✘ ${e.message}\x1b[0m`); rl.close(); process.exit(1); });
