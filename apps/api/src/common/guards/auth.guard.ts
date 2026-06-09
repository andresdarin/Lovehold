import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import jwt from 'jsonwebtoken'

export interface AuthenticatedUser {
  authUserId: string
  email: string
}

/**
 * AuthGuard que valida JWTs de Supabase Auth.
 *
 * Algoritmo actualmente soportado: **HS256** (simétrico).
 *
 * Usa `SUPABASE_JWT_SECRET` del environment, que es el secreto compartido
 * del proyecto en Supabase (Settings → API → JWT Secret).
 *
 * ── Pendiente: soporte para RS256 / ES256 ──
 * Si el proyecto de Supabase está configurado con **JWT Signing Keys**
 * (asimétricas, tipo RS256 o ES256), este guard NO va a funcionar.
 *
 * Para migrar a JWKS:
 * 1. Reemplazar `jsonwebtoken` por `jose`.
 * 2. Obtener la JWKS desde:
 *    `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`
 * 3. Verificar el token contra la key indicada por el `kid` del header.
 *
 * @see decodeTokenHeader() en common/utils/decode-token-header.ts
 *   para inspeccionar el algoritmo de un token real sin verificarlo.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header')
    }

    const token = authHeader.split(' ')[1]!

    try {
      const secret = this.configService.get<string>('SUPABASE_JWT_SECRET')
      if (!secret) {
        throw new UnauthorizedException('JWT secret not configured')
      }

      const payload = jwt.verify(token, secret, { algorithms: ['HS256'] }) as {
        sub: string
        email: string
      }

      request.user = {
        authUserId: payload.sub,
        email: payload.email,
      } satisfies AuthenticatedUser

      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
