import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { extractToken, verifyToken } from '../utils';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) throw new ForbiddenException('User role is missing!');

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) throw new ForbiddenException('Auth token missing!');

    const verifiedToken: any = await verifyToken(extractToken(token));

    const userRole = verifiedToken?.type;

    if (!userRole) throw new ForbiddenException('User not found');

    const hasRole = requiredRoles.some(
      (role) => userRole.toLowerCase() === role,
    );
    if (!hasRole) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
