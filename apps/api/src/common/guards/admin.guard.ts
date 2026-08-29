import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user || {}
    const claims = user.app_metadata || user.user_metadata || {}
    if (user.role === 'ADMIN' || user.role === 'admin' || user.isAdmin === true || claims.role === 'ADMIN' || claims.admin === true) return true
    throw new ForbiddenException('Admin role required')
  }
}
