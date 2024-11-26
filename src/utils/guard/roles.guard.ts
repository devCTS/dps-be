import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Get,
  Ip,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { extractToken, verifyToken } from '../utils';
import { Role } from '../enum/enum';
import { EntityManager } from 'typeorm';
import { Merchant } from 'src/merchant/entities/merchant.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private merchantEntity: EntityManager,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles) throw new ForbiddenException('User role is missing!');

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    let ip = request.connection.remoteAddress.substring(7);

    if (!token) throw new ForbiddenException('Auth token missing!');

    const verifiedToken: any = await verifyToken(extractToken(token));

    if (verifiedToken?.type.toLowerCase() === Role.MERCHANT) {
      const merchant = await this.merchantEntity.findOne(Merchant, {
        where: { id: verifiedToken.id },
        relations: ['identity', 'identity.ips'],
      });

      if (merchant.identity.ips.length === 0) return;

      let whiteListedIps = [];

      merchant.identity.ips.forEach((item) => whiteListedIps.push(item.value));

      if (!whiteListedIps.includes(ip)) {
        throw new ForbiddenException('Ip restricted');
      }
    }

    if (requiredRoles.includes('all')) return true;

    const userRole = verifiedToken?.type;

    if (!userRole) throw new ForbiddenException('User not found');

    const hasRole = requiredRoles.some(
      (role) => userRole.toLowerCase() === role,
    );
    if (!hasRole) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
