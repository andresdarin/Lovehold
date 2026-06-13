import { parseReceiptText, normalizeProductName } from './parseReceiptText.ts'

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(`FAIL: ${msg}`)
  console.log(`  OK ${msg}`)
}

function approx(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.01
}

function testLongDash() {
  const text = [
    'Huevos San Agustín 15 un — Alimentos — $199,00',
    'Papel higiénico SAK 30 mt x 16 ro — Higiene / Hogar — $319,00',
    'Cebolla colorada — Verduras — $10,01',
    'Queso cheddar Conaprole — Lácteos — $106,80',
  ].join('\n')

  const r = parseReceiptText(text)
  assert(r.items.length === 4, 'parses 4 items')
  assert(r.items[0]!.name === 'Huevos San Agustín 15 un', 'item 0 name')
  assert(approx(r.items[0]!.totalPrice, 199.00), 'item 0 price')
  assert(r.items[0]!.category === 'alimentos', 'item 0 category')
  assert(r.items[0]!.rawLine.includes('$199,00'), 'item 0 rawLine preserved')
  assert(r.items[1]!.name === 'Papel higiénico SAK 30 mt x 16 ro', 'item 1 name')
  assert(r.items[1]!.category === 'higiene', 'item 1 normalized Higiene / Hogar → higiene')
  assert(r.items[2]!.category === 'alimentos', 'item 2 Verduras → alimentos')
  assert(r.items[3]!.category === 'alimentos', 'item 3 Lácteos → alimentos')
  assert(approx(r.detectedTotal, 634.81), 'detectedTotal = sum')
}

function testRegularDash() {
  const r = parseReceiptText('Leche - Alimentos - 89,90\nPan - Alimentos - 45,00')
  assert(r.items.length === 2, 'parses 2 items')
  assert(r.items[0]!.name === 'Leche', 'item 0 name')
  assert(approx(r.items[0]!.totalPrice, 89.90), 'item 0 price')
}

function testPriceWithoutSymbol() {
  const r = parseReceiptText('Arroz — Alimentos — 99,90\nFideos — Alimentos — 45,50')
  assert(r.items.length === 2, 'parses 2 items')
  assert(approx(r.items[0]!.totalPrice, 99.90), 'comma decimal')
}

function testThousandsSeparator() {
  const r = parseReceiptText('TV LED — Electrónica — $12.999,90')
  assert(r.items.length === 1, 'parses 1 item')
  assert(approx(r.items[0]!.totalPrice, 12999.90), '12.999,90 parsed')
}

function testEmptyLines() {
  const r = parseReceiptText('Leche — Alimentos — $50,00\n   \nPan — Alimentos — $30,00')
  assert(r.items.length === 2, '2 items parsed')
  assert(r.ignored.length === 0, 'blank lines not pushed to ignored')
}

function testSlashCategories() {
  const r = parseReceiptText([
    'Coca-Cola — Bebidas — $120,00',
    'Papas — Snacks / Dulces — $80,00',
    'Detergente — Limpieza / Hogar — $150,00',
  ].join('\n'))
  assert(r.items[0]!.category === 'bebidas', 'Bebidas → bebidas')
  assert(r.items[1]!.category === 'snacks', 'Snacks / Dulces → snacks')
  assert(r.items[2]!.category === 'limpieza', 'Limpieza / Hogar → limpieza')
}

function testIgnoredLines() {
  const r = parseReceiptText([
    'RUT: 123456-7',
    'Fecha: 13/06/2026',
    'Caja: 003',
    'Leche — Alimentos — $60,00',
    'IVA: $11,40',
    'Tarjeta crédito',
  ].join('\n'))
  assert(r.items.length === 1, 'only 1 valid item')
  assert(r.ignored.length >= 4, '4+ lines ignored')
}

function testPriceOnlyLine() {
  const r = parseReceiptText('$199,00\nLeche — Alimentos — $50,00')
  assert(r.items.length === 1, 'only 1 valid item')
  assert(r.ignored.length === 1, '1 ignored (price only)')
}

function testOldFormatFallback() {
  const r = parseReceiptText('Arroz 99,90\nFideos 45\nPan $30,00')
  assert(r.items.length === 3, '3 items parsed')
  assert(approx(r.items[0]!.totalPrice, 99.90), 'comma decimal')
  assert(approx(r.items[1]!.totalPrice, 45.00), 'integer')
  assert(approx(r.items[2]!.totalPrice, 30.00), 'with $')
  assert(r.items[0]!.category === 'alimentos', 'defaults to alimentos')
}

function testMixedFormat() {
  const r = parseReceiptText('Leche — Alimentos — $60,00\nPan 45,00\nQueso — Lácteos — $120,00')
  assert(r.items.length === 3, '3 items parsed')
  assert(r.items[0]!.name === 'Leche', 'structured detected')
  assert(r.items[1]!.name === 'Pan', 'old format fallback')
}

function testAlcoholCategory() {
  const r = parseReceiptText('Cerveza — Alcohol — $200,00')
  assert(r.items.length === 1, '1 item')
  assert(r.items[0]!.category === 'bebidas', 'Alcohol → bebidas')
}

function testNormalizeName() {
  assert(normalizeProductName('  Papas Fritas  ') === 'papas fritas', 'trims and lowercases')
  assert(normalizeProductName('Papas   Fritas') === 'papas fritas', 'collapses spaces')
}

function testTotalFromSum() {
  const r = parseReceiptText('A — Alimentos — $100,00\nB — Bebidas — $200,50\nC — Snacks — $50,00')
  assert(approx(r.detectedTotal, 350.50), 'sum = 350.50')
}

function run() {
  console.log('\nparseReceiptText tests:\n')
  const tests = [
    testLongDash, testRegularDash, testPriceWithoutSymbol,
    testThousandsSeparator, testEmptyLines, testSlashCategories,
    testIgnoredLines, testPriceOnlyLine, testOldFormatFallback,
    testMixedFormat, testAlcoholCategory, testNormalizeName, testTotalFromSum,
  ]
  let passed = 0
  let failed = 0
  for (const t of tests) {
    try {
      console.log(`\n${t.name}`)
      t()
      passed++
    } catch (e) {
      console.log(`\n${t.name}`)
      console.log(`  ${String(e)}`)
      failed++
    }
  }
  console.log(`\n${passed} passed, ${failed} failed\n`)
}

run()
