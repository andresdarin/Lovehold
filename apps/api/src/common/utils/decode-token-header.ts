export interface DecodedTokenHeader {
  alg: string
  kid?: string
  typ?: string
}

const TOKEN_HEADER_WARNING = `
⚠️  Token header inspection — only for debugging algorithm detection.
   Paste ONLY into a local script or browser console. Never share decoded output publicly.
`

/**
 * Decodes the **header** of a JWT *without verifying the signature*.
 *
 * Use this ONLY to check which algorithm (alg) your Supabase project is using:
 *   - "HS256" → symmetric key (SUPABASE_JWT_SECRET)
 *   - "RS256" / "ES256" → asymmetric keys (JWKS endpoint)
 *
 * @example
 * ```ts
 * const header = decodeTokenHeader("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...")
 * console.log(header.alg) // "RS256"
 * ```
 *
 * @throws if the token is not a valid 3-part JWT or the header isn't valid JSON.
 */
export function decodeTokenHeader(token: string): DecodedTokenHeader {
  const parts = token.split('.')

  if (parts.length !== 3) {
    throw new Error('Invalid JWT: expected 3 dot-separated segments')
  }

  const rawHeader = parts[0]!

  try {
    const decoded = atob(rawHeader)
    return JSON.parse(decoded) as DecodedTokenHeader
  } catch {
    throw new Error('Failed to decode JWT header')
  }
}

/**
 * Prints the decoded header to the console with a safety warning.
 * Intended for local debugging only.
 */
export function debugTokenAlgorithm(token: string): void {
  console.log(TOKEN_HEADER_WARNING)
  const header = decodeTokenHeader(token)
  console.log('JWT header:', JSON.stringify(header, null, 2))
  console.log(`Algoritmo detectado: ${header.alg}`)

  if (header.alg === 'HS256') {
    console.log('→ El guard actual SOPORTA este algoritmo (HS256 con SUPABASE_JWT_SECRET).')
  } else {
    console.log(
      `→ El guard actual NO soporta ${header.alg}. ` +
        'Debe migrarse a validación con jose + JWKS (ver TODO en auth.guard.ts).'
    )
  }
}
