const { chromium } = require('C:/Users/Usuario/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const user = { id: 'fixture-user', email: 'ana@example.test', app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: new Date().toISOString() };
  const token = ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url'), 'fixture'].join('.');
  const session = { access_token: token, refresh_token: 'fixture-refresh', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user };
  await context.addCookies([{ name: 'sb-127-auth-token', value: 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url'), url: 'http://localhost:3100' }]);
  const now = new Date().toISOString();
  const expenses = [
    { id: 'e1', title: 'Compra en TSVNM SAS ZEN PRADO', amount: 758.56, currency: 'UYU', date: now, type: 'supermarket', movementType: 'EXPENSE', category: 'supermercado', items: [] },
    { id: 'e3', title: 'Sueldo', amount: 58000, currency: 'UYU', date: now, type: 'variable', movementType: 'INCOME', category: 'salario', items: [] },
  ];
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.port === '3100') return route.continue();
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }, body: JSON.stringify(body) });
    if (route.request().method() === 'OPTIONS') return json({});
    if (url.port !== '3101' && url.port !== '54321') return route.abort();
    if (url.pathname === '/api/me') return json({ id: 'p1', email: user.email, displayName: 'Ana', color: '#407E8C', avatarUrl: null });
    if (url.pathname === '/api/personal-finance') return json(expenses);
    if (url.pathname === '/api/finance/accounts') return json([{ id: 'cash', profileId: 'p1', name: 'Efectivo', type: 'CASH', currency: 'UYU', balance: 15800, isActive: true, isSpendable: true }]);
    if (url.pathname === '/api/finance/snapshot') return json({ balances: { spendableByCurrency: { UYU: '15800.00' }, creditDebtByCurrency: {} }, asOf: now });
    if (url.pathname === '/api/households') return json([]);
    if (url.port === '54321') return json({ user });
    return json([]);
  });
  const page = await context.newPage();
  fs.mkdirSync('tmp', { recursive: true });
  for (const theme of ['dark', 'light']) {
    await page.goto('http://localhost:3100/dashboard');
    await page.evaluate(theme => { localStorage.setItem('theme', theme); document.documentElement.classList.toggle('dark', theme === 'dark'); }, theme);
    await page.getByText('Dónde se va tu dinero').waitFor({ timeout: 15000 });
    await page.getByText('Compra en TSVNM SAS ZEN PRADO').waitFor();
    await page.screenshot({ path: `tmp/dashboard-check-${theme}.png`, fullPage: false });
  }
  console.log('captured');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
