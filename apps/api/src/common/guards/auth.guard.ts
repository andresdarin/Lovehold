import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import jwt from 'jsonwebtoken'
import { createRemoteJWKSet, jwtVerify } from 'jose'

export interface AuthenticatedUser {
  authUserId: string
  email: string
}

let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null

function getJWKS(supabaseUrl: string) {
  if (!jwksCache) {
    const url = new URL('/auth/v1/.well-known/jwks.json', supabaseUrl)
    jwksCache = createRemoteJWKSet(url)
  }
  return jwksCache
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

    try {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL')
      const jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET')

      if (!supabaseUrl && !jwtSecret) {
        throw new UnauthorizedException('Auth credentials not configured')
      }

      let payload: { sub: string; email: string }

      try {
        const { payload: verified } = await jwtVerify(
          token,
          getJWKS(supabaseUrl ?? ''),
        )
        payload = verified as unknown as { sub: string; email: string }
      } catch {
        if (!jwtSecret) {
          throw new UnauthorizedException('Invalid or expired token')
        }

        payload = jwt.verify(token, jwtSecret, {
          algorithms: ['HS256'],
        }) as { sub: string; email: string }
      }

      request.user = {
        authUserId: payload.sub,
        email: payload.email ?? '',
      } satisfies AuthenticatedUser

      return true
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
