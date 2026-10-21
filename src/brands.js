// Крупные сети: юридическое или «банковское» название → простой бренд.
// «LIDL SUPERMERCADOS S.A.U» → «Lidl», «PYATEROCHKA 1123» → «Пятёрочка».
// Порядок важен: более конкретные шаблоны (Zara Home, Uber Eats) стоят раньше общих (Zara, Uber).
// Маленькие магазины не трогаем — остаётся название как на чеке.
const BRANDS = [
  // супермаркеты — Испания
  [/mercadona/i, 'Mercadona'],
  [/\blidl\b/i, 'Lidl'],
  [/alcampo/i, 'Alcampo'],
  [/carrefour/i, 'Carrefour'],
  [/\baldi\b/i, 'Aldi'],
  [/^(supermercados\s+)?dia\b|\bdia\s+(retail|%|market|supermercado|maxi)|\bsupermercados\s+dia\b/i, 'Dia'],
  [/eroski/i, 'Eroski'],
  [/hipercor/i, 'Hipercor'],
  [/supercor/i, 'Supercor'],
  [/corte\s*ingl[eé]s/i, 'El Corte Inglés'],
  [/\bconsum\b/i, 'Consum'],
  [/ahorram[aá]s/i, 'Ahorramas'],
  [/caprabo/i, 'Caprabo'],
  [/\bbm\s+supermercados|\bsupermercados\s+bm\b/i, 'BM'],
  [/masymas/i, 'Masymas'],
  [/covir[aá]n/i, 'Covirán'],
  [/\bgadis\b/i, 'Gadis'],
  [/\bcondis\b/i, 'Condis'],
  [/bonpreu/i, 'Bonpreu'],
  [/\bspar\b/i, 'Spar'],
  [/supersol/i, 'Supersol'],
  // одежда, дом, техника
  [/zara\s*home/i, 'Zara Home'],
  [/\bzara\b/i, 'Zara'],
  [/bershka/i, 'Bershka'],
  [/pull\s*(&|and|y)\s*bear/i, 'Pull&Bear'],
  [/stradivarius/i, 'Stradivarius'],
  [/massimo\s*dutti/i, 'Massimo Dutti'],
  [/\boysho\b/i, 'Oysho'],
  [/\bmango\b/i, 'Mango'],
  [/\bh\s*&\s*m\b|hennes\s*&?\s*mauritz/i, 'H&M'],
  [/primark/i, 'Primark'],
  [/uniqlo/i, 'Uniqlo'],
  [/decathlon|декатлон/i, 'Decathlon'],
  [/\bikea\b|икеа/i, 'IKEA'],
  [/leroy\s*merlin|леруа/i, 'Leroy Merlin'],
  [/bricomart/i, 'Bricomart'],
  [/media\s*markt/i, 'MediaMarkt'],
  [/\bfnac\b/i, 'Fnac'],
  [/aliexpress/i, 'AliExpress'],
  [/amazon|\bamzn\b/i, 'Amazon'],
  [/\bdruni\b/i, 'Druni'],
  [/\bprimor\b/i, 'Primor'],
  [/sephora/i, 'Sephora'],
  [/flying\s*tiger/i, 'Flying Tiger'],
  // топливо
  [/repsol/i, 'Repsol'],
  [/cepsa|\bmoeve\b/i, 'Cepsa'],
  [/\bgalp\b/i, 'Galp'],
  [/\bshell\b/i, 'Shell'],
  [/\bbp\b(?!\w)/i, 'BP'],
  // еда вне дома и доставка
  [/mc\s*donald/i, "McDonald's"],
  [/burger\s*king/i, 'Burger King'],
  [/\bkfc\b/i, 'KFC'],
  [/starbucks/i, 'Starbucks'],
  [/telepizza/i, 'Telepizza'],
  [/domino'?s\s*pizza|\bdominos\b/i, "Domino's"],
  [/100\s*montaditos/i, '100 Montaditos'],
  [/\bglovo\b/i, 'Glovo'],
  [/uber\s*\*?\s*eats/i, 'Uber Eats'],
  [/just\s*eat/i, 'Just Eat'],
  [/deliveroo/i, 'Deliveroo'],
  [/\bwolt\b/i, 'Wolt'],
  // транспорт и поездки
  [/\buber\b/i, 'Uber'],
  [/cabify/i, 'Cabify'],
  [/\bbolt\b/i, 'Bolt'],
  [/free\s*now/i, 'FreeNow'],
  [/\bzity\b/i, 'Zity'],
  [/share\s*now/i, 'Share Now'],
  [/free2move/i, 'Free2Move'],
  [/\brenfe\b/i, 'Renfe'],
  [/\biberia\b/i, 'Iberia'],
  [/ryanair/i, 'Ryanair'],
  [/vueling/i, 'Vueling'],
  [/airbnb/i, 'Airbnb'],
  [/booking\.com/i, 'Booking.com'],
  // подписки и сервисы
  [/spotify/i, 'Spotify'],
  [/netflix/i, 'Netflix'],
  [/apple\.com|itunes|\bapple\s+services/i, 'Apple'],
  [/google\s*\*|google\s*play/i, 'Google'],
  [/basic[\s-]*fit/i, 'Basic-Fit'],
  // Россия
  [/пят[её]рочк|pyaterochka|\b5ka\b/i, 'Пятёрочка'],
  [/перекр[её]ст|perekrestok/i, 'Перекрёсток'],
  [/вкусвилл|vkusvill/i, 'ВкусВилл'],
  [/(?<!\p{L})магнит(?!\p{L})|\bmagnit\b/iu, 'Магнит'],
  [/ашан|\bauchan\b/i, 'Ашан'],
  [/(?<!\p{L})лента(?!\p{L})|\blenta\b/iu, 'Лента'],
  [/дикси|\bdixy\b/i, 'Дикси'],
  [/азбука\s*вкуса|azbuka\s*vkusa/i, 'Азбука вкуса'],
  [/\bozon\b|(?<!\p{L})озон(?!\p{L})/iu, 'Ozon'],
  [/wildberries|вайлдберриз/i, 'Wildberries'],
  [/yandex\s*\*?\s*\.?\s*eda|яндекс\s*\.?\s*еда/i, 'Яндекс Еда'],
  [/yandex\s*\*?\s*\.?\s*go\b|яндекс\s*\.?\s*go\b/i, 'Яндекс Go'],
  [/yandex\s*\*?\s*lavka|яндекс\s*лавка/i, 'Яндекс Лавка'],
  [/samokat|самокат/i, 'Самокат'],
  [/\bkuper\b|(?<!\p{L})купер(?!\p{L})/iu, 'Купер'],
  [/delimobil|делимобил/i, 'Делимобиль'],
];

export function brandOf(name) {
  const s = String(name || '');
  for (const [re, brand] of BRANDS) if (re.test(s)) return brand;
  return null;
}

// Название для показа: бренд крупной сети или исходное название без лишних пробелов
export function normalizeMerchant(name) {
  const s = String(name || '').replace(/\s+/g, ' ').trim();
  return brandOf(s) || s;
}
