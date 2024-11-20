import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { Agent } from 'src/agent/entities/agent.entity';
import { Member } from 'src/member/entities/member.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { IsNull, Not, Or, Repository } from 'typeorm';

@Injectable()
export class OverviewAdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
  ) {}

  async getUserAnalytics() {
    const adminCount = await this.adminRepository.count();
    const merchantCount = await this.merchantRepository.count();
    const memberCount = await this.memberRepository.count();
    const agentCount = await this.agentRepository.count();

    const memberAgentsCount = await this.memberRepository.count({
      where: {
        referredMember: {
          id: Not(IsNull()),
        },
      },
      relations: ['referredMember'],
    });

    const selfRegisteredMembersCount = await this.memberRepository.count({
      where: {
        selfRegistered: true,
      },
    });

    const latestSelfRegisteredMembers = await this.memberRepository.find({
      where: {
        selfRegistered: true,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 10,
      relations: ['identity'],
    });

    return {
      userInfo: {
        admins: adminCount,
        merchants: merchantCount,
        agents: agentCount + memberAgentsCount,
        members: memberCount,
      },
      memberData: {
        self: selfRegisteredMembersCount,
        admin: Math.abs(memberCount - selfRegisteredMembersCount),
      },
      members: latestSelfRegisteredMembers.map((row) => {
        return {
          name: row.firstName + ' ' + row.lastName,
          gmail: row.identity.email,
          onboardingDate: row.createdAt,
        };
      }),
    };
  }
}
