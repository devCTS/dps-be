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
import { Admin } from 'src/admin/entities/admin.entity';

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

    if (requiredRoles.includes('all')) return true;

    if (!requiredRoles) throw new ForbiddenException('User role is missing!');

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    let ip = request.headers['x-forwarded-for'] as string;

    if (!token) throw new ForbiddenException('Auth token missing!');

    const verifiedToken: any = await verifyToken(extractToken(token));

    if (verifiedToken) {
      const userType = verifiedToken?.userType;
      switch (userType) {
        case Role.AGENT:
          const agent = this.entityManager.findOne(Agent, {
            where: {
              id: verifiedToken.id,
            },
          });

          if (!agent) throw new ForbiddenException('Agent not found.');
          break;

        case Role.MEMBER:
          const member = this.entityManager.findOne(Member, {
            where: {
              id: verifiedToken.id,
            },
          });

          if (!member) throw new ForbiddenException('Member not found.');
          break;
        case Role.MERCHANT:
          const merchant = this.entityManager.findOne(Merchant, {
            where: {
              id: verifiedToken.id,
            },
          });

          if (!merchant) throw new ForbiddenException('Merchant not found');
          break;
        case Role.SUB_ADMIN || Role.SUPER_ADMIN:
          const admin = this.entityManager.findOne(Admin, {
            where: {
              id: verifiedToken.id,
            },
          });

          if (!admin) throw new ForbiddenException('Admin not found');
          break;

        case Role.SUB_MERCHANT:
          const subMerchant = this.entityManager.findOne(Submerchant, {
            where: {
              id: verifiedToken.id,
            },
          });

          if (!subMerchant)
            throw new ForbiddenException('Sub merchant not found');
          break;

        default:
          break;
      }
    }

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

      let whiteListedIps: any = [...merchant.identity?.ips];

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

    const userRole = verifiedToken?.type;

    if (!userRole) throw new ForbiddenException('User not found');

    const hasRole = requiredRoles.some(
      (role) => userRole.toLowerCase() === role,
    );
    if (!hasRole) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
