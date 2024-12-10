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
import { Member } from 'src/member/entities/member.entity';
import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import { Agent } from 'src/agent/entities/agent.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private entityManager: EntityManager,
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

    if (
      verifiedToken?.type &&
      verifiedToken?.type.toLowerCase() === Role.MERCHANT
    ) {
      const merchant = await this.entityManager.findOne(Merchant, {
        where: { id: verifiedToken.id },
        relations: ['identity', 'identity.ips'],
      });

      if (!merchant.enabled)
        throw new ForbiddenException('Merchant is disabled.');

      if (merchant.identity.ips.length === 0) return true;

      let whiteListedIps = [];

      merchant.identity.ips.forEach((item) => whiteListedIps.push(item.value));

      if (!whiteListedIps.includes(ip)) {
        throw new ForbiddenException('Ip restricted');
      }
    }

    if (verifiedToken?.type) {
      let user = null;
      switch (verifiedToken.type.toLowerCase()) {
        case Role.MEMBER:
          user = await this.entityManager.findOne(Member, {
            where: { id: verifiedToken.id },
          });

          break;

        case Role.AGENT:
          user = await this.entityManager.findOne(Agent, {
            where: { id: verifiedToken.id },
          });

          break;
        case Role.SUB_MERCHANT:
          user = await this.entityManager.findOne(Submerchant, {
            where: { id: verifiedToken.id },
          });

          break;

        default:
          break;
      }

      if (user && !user.enabled)
        throw new ForbiddenException(`${verifiedToken.type} is not enabled.`);
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
