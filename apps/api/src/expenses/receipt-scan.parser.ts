function parseJson(json: string): unknown | null {
  try {
    return JSON.parse(json)
  } catch (e) {
    console.error('[ReceiptScan] JSON.parse error:', (e as Error).message)
    console.error('[ReceiptScan] Failed JSON string (first 2000 chars):', json.slice(0, 2000))
  }

  const fixed = json
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/(['"])?([a-zA-Z_][a-zA-Z_0-9]*)['"]?\s*:/g, '"$2":')
    .replace(/:\s*'([^']*)'/g, ':"$1"')
    .replace(/\/\/.*$/gm, '')
    .replace(/,\s*$/gm, '')

  try {
    return JSON.parse(fixed)
  } catch (e) {
    console.error('[ReceiptScan] Fixed JSON.parse error:', (e as Error).message)
    console.error('[ReceiptScan] Fixed JSON string (first 2000 chars):', fixed.slice(0, 2000))
    return null
  }
}

function extractFirstJsonObject(text: string): string | null {
  let start = -1
  let depth = 0
  let inString = false
  let escaped = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]

    if (start === -1) {
      if (char === '{') {
        start = i
        depth = 1
      }
      continue
    }

    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }

    if (char === '"') inString = true
    else if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return text.slice(start, i + 1)
    }
  }

  return null
}

export function parseGeminiResponse(text: string): unknown | null {
  const cleaned = text.trim()

  const extracted = extractFirstJsonObject(cleaned)
  if (extracted) {
    const result = parseJson(extracted)
    if (result) return result

    console.error('[ReceiptScan] Failed to parse extracted JSON object.')
    console.error('[ReceiptScan] Extracted:', extracted)
  }

  const result = parseJson(cleaned)
  if (result) return result

  console.error('[ReceiptScan] All JSON parsing strategies failed.')
  console.error('[ReceiptScan] Full Gemini response text follows:')
  console.error(text)
  console.error('[ReceiptScan] End of text.')
  return null
}
