import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Roles, ROLES_KEY } from './roles.decorator';
import { Role } from './roles.enum';
import { extractToken, verifyToken } from 'src/utils/utils';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get(ROLES_KEY, context.getHandler());
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    const verifiedToken: jwt.JwtPayload | { user: string } | string =
      await verifyToken(extractToken(token));

    const data = JSON.stringify(verifiedToken);

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!roles) {
      return true;
    }

    try {
      // return roles.some((role) => verifiedToken?.includes(role));
    } catch (error) {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
