import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import jwt from 'jsonwebtoken'
import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } from 'jose'

export interface AuthenticatedUser {
  authUserId: string
  email: string
  role?: string
  isAdmin?: boolean
  app_metadata?: Record<string, unknown>
  user_metadata?: Record<string, unknown>
}

let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null

function getJWKS(supabaseUrl: string) {
  if (!jwksCache) {
    const url = new URL('/auth/v1/.well-known/jwks.json', supabaseUrl)
    // Avoid leaving requests hanging when the API host cannot reach Supabase.
    jwksCache = createRemoteJWKSet(url, { timeoutDuration: 5_000 })
  }
  return jwksCache
}

function isConfiguredSecret(secret: string | undefined): secret is string {
  return Boolean(secret && secret !== 'your-jwt-secret')
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header')
    }

    const token = authHeader.split(' ')[1]!

    if (!token) {
      throw new UnauthorizedException('Missing access token')
    }

    // Never log the token itself; its length is enough to diagnose an empty
    // or truncated access token.
    console.debug(`[AuthGuard] access token received (length=${token.length})`)

    try {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL')
      const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET')
      const configuredSecret = isConfiguredSecret(jwtSecret) ? jwtSecret : undefined

      if (!supabaseUrl && !configuredSecret) {
        throw new UnauthorizedException('Auth credentials not configured')
      }

      let payload: { sub: string; email: string; role?: string; isAdmin?: boolean; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }

      const tokenHeader = decodeProtectedHeader(token)
      console.debug(`[AuthGuard] token algorithm=${tokenHeader.alg}, kid=${tokenHeader.kid ?? 'none'}`)

      if (tokenHeader.alg === 'HS256') {
        if (!configuredSecret) {
          throw new UnauthorizedException('HS256 token received but SUPABASE_JWT_SECRET is not configured')
        }
        try {
          payload = jwt.verify(token, configuredSecret, {
            algorithms: ['HS256'],
          }) as { sub: string; email: string; role?: string; isAdmin?: boolean; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }
        } catch (hsErr) {
          throw new UnauthorizedException(`Invalid or expired token (HS256 verification failed: ${hsErr instanceof Error ? hsErr.message : String(hsErr)})`)
        }
      } else {
        if (!supabaseUrl) {
          throw new UnauthorizedException('Asymmetric token received but SUPABASE_URL is not configured')
        }
        try {
          const { payload: verified } = await jwtVerify(token, getJWKS(supabaseUrl))
          payload = verified as unknown as { sub: string; email: string; role?: string; isAdmin?: boolean; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> }
        } catch (joseErr) {
          const message = joseErr instanceof Error ? joseErr.message : String(joseErr)
          console.warn(`[AuthGuard] Supabase JWKS verification failed for ${supabaseUrl}: ${message}`)
          throw new UnauthorizedException(`Invalid or expired token (JWKS verification failed: ${message})`)
        }
      }

      request.user = {
        authUserId: payload.sub,
        email: payload.email ?? '',
        role: payload.role,
        isAdmin: payload.isAdmin,
        app_metadata: payload.app_metadata,
        user_metadata: payload.user_metadata,
      } satisfies AuthenticatedUser

      return true
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
