const ARITHMETIC_WARNING_PATTERNS = [
  /\bcalculated\b/i,
  /\bdiscounts?\b/i,
  /\biva\b/i,
  /\bsubtotal\b/i,
  /\btax(?:es)?\b/i,
  /\bdescuentos?\b/i,
  /\bimpuestos?\b/i,
  /\bcoincid/i,
]

function isArithmeticWarning(warning: string): boolean {
  const normalized = warning.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return ARITHMETIC_WARNING_PATTERNS.some((pattern) => pattern.test(normalized))
}

export function normalizeGeminiWarnings(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []

  return raw
    .filter((warning): warning is string => typeof warning === 'string')
    .map((warning) => warning.trim())
    .filter((warning) => warning.length > 0 && !isArithmeticWarning(warning))
}
