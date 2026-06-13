import { parseReceiptText } from './src/components/personal-finance/parseReceiptText.ts'

function test(desc: string, text: string) {
  const r = parseReceiptText(text)
  console.log(`\n=== ${desc} ===`)
  console.log('Input:', JSON.stringify(text))
  console.log('Items:', JSON.stringify(r.items, null, 2))
  console.log('Ignored:', JSON.stringify(r.ignored))
  console.log('Total:', r.detectedTotal)
}

test('structured with —', 'A — Alimentos — $100,00\nB — Bebidas — $200,50\nC — Snacks — $50,00')
test('structured with -', 'Leche - Alimentos - 89,90')
test('old format', 'Arroz 99,90')
