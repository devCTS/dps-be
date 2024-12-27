import { TreeNode } from './../utils/enum/enum';
import {
  ConflictException,
  HttpCode,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Repository } from 'typeorm';
import { Member } from 'src/member/entities/member.entity';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { UpdateTeamCommissionsDto } from './dto/update-commissions.dto';
import { SystemConfigService } from 'src/system-config/system-config.service';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,

    private readonly systemConfigService: SystemConfigService,
  ) {}

  async createTeam(leadingMemberId: number, subMemberId: number) {
    const leadingMember = await this.memberRepository.findOneBy({
      id: leadingMemberId,
    });
    if (!leadingMember)
      throw new NotFoundException('Leading member not found.');

    const team = await this.teamRepository.findOne({
      where: {
        teamLeader: { id: leadingMember.id },
      },
      relations: ['teamLeader'],
    });
    if (team) throw new ConflictException('Team already exists.');

    const createdTeam = await this.teamRepository.save({
      teamLeader: leadingMember,
    });

    await this.memberRepository.update(leadingMember.id, {
      teamId: createdTeam.teamId,
    });

    await this.memberRepository.update(subMemberId, {
      teamId: createdTeam.teamId,
    });

    return HttpStatus.CREATED;
  }

  async incrementTeamSize(teamId) {
    const team = await this.teamRepository.findOneBy({ teamId });
    if (team)
      await this.teamRepository.update(teamId, { teamSize: ++team.teamSize });
  }

  async updateTeamQuota(teamId, amount) {
    const team = await this.teamRepository.findOneBy({
      teamId,
    });

    if (team)
      await this.teamRepository.update(team.teamId, {
        totalQuota: (team.totalQuota += amount),
      });
  }

  async updateTeamCommissionRates(
    teamId: string,
    updateDto: UpdateTeamCommissionsDto,
  ) {
    const {
      teamPayinCommissionRate,
      teamPayoutCommissionRate,
      teamTopupCommissionRate,
    } = updateDto;

    const team = await this.teamRepository.findOneBy({ teamId });
    if (!team) throw new NotFoundException('Team not found!');

    await this.teamRepository.update(team.teamId, {
      teamPayinCommissionRate,
      teamPayoutCommissionRate,
      teamTopupCommissionRate,
    });

    return HttpStatus.OK;
  }

  async paginate(paginateDto: PaginateRequestDto) {
    const query = this.teamRepository.createQueryBuilder('team');

    query.leftJoinAndSelect('team.teamLeader', 'teamLeader');

    const search = paginateDto.search;
    const pageSize = paginateDto.pageSize;
    const pageNumber = paginateDto.pageNumber;
    const sortBy = paginateDto.sortBy;

    if (search)
      query.andWhere(
        `CONCAT(teamLeader.first_name, ' ', teamLeader.last_name, ' ', teamLeader.teamId) ILIKE :search`,
        { search: `%${search}%` },
      );

    if (paginateDto.startDate && paginateDto.endDate) {
      const startDate = parseStartDate(paginateDto.startDate);
      const endDate = parseEndDate(paginateDto.endDate);

      query.andWhere('team.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    query.andWhere('team.teamSize > 2');

    query.orderBy('team.totalQuota', 'ASC').addOrderBy('team.teamSize', 'ASC');

    const skip = (pageNumber - 1) * pageSize;
    query.skip(skip).take(pageSize);

    const [rows, total] = await query.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    return {
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
      data: rows,
    };
  }

  async getTeamTree(teamId: string) {
    const teamMembers = await this.memberRepository.find({
      where: {
        teamId,
      },
      relations: ['agent', 'identity'],
    });

    return this.buildTree(teamMembers);
  }

  async buildTree(members: Member[]) {
    const rootMember = members.find((member) => !member.agent);

    const getChildren = async (
      parentId: number,
      ancestorsOfParent: number[],
    ) => {
      const children = members.filter(
        (member) => member.agent?.id === parentId,
      );

      return Promise.all(
        children.map(async (obj) => {
          const memberRates = await this.getMemberRates(obj?.teamId);

          return {
            id: obj.id,
            children: await getChildren(obj.id, [
              ...ancestorsOfParent,
              parentId,
            ]),
            name: obj.firstName + ' ' + obj.lastName,
            email: obj.identity?.email,
            isAgent: false,
            ancestors: [...ancestorsOfParent, parentId],
            balance: null,
            quota: obj.quota,
            serviceRate: null,
            ratesOfAgent: {
              payin: obj.agentCommissions?.payinCommissionRate ?? null,
              payout: obj.agentCommissions?.payoutCommissionRate ?? null,
            },
            memberRates: {
              payin: memberRates.payin,
              payout: memberRates.payout,
            },
          };
        }),
      );
    };

    const rootMemberRates = await this.getMemberRates(rootMember?.teamId);

    const tree: TreeNode = {
      id: rootMember.id,
      children: await getChildren(rootMember.id, []),
      name: rootMember.firstName + ' ' + rootMember.lastName,
      email: rootMember.identity?.email,
      isAgent: false,
      ancestors: [],
      balance: null,
      quota: rootMember.quota,
      serviceRate: null,
      ratesOfAgent: null,
      memberRates: {
        payin: rootMemberRates.payin,
        payout: rootMemberRates.payout,
      },
    };

    return {
      tree,
      id: rootMember.teamId,
      name: tree.name,
    };
  }

  private getMemberRates = async (teamId) => {
    let team;
    if (teamId) team = await this.teamRepository.findOneBy({ teamId });
    if (
      team?.teamPayinCommissionRate > 0 ||
      team?.teamPayoutCommissionRate > 0
    ) {
      return {
        payin: team?.teamPayinCommissionRate,
        payout: team?.teamPayoutCommissionRate,
      };
    }

    const systemConfig = await this.systemConfigService.findLatest();
    return {
      payin: systemConfig?.payinCommissionRateForMember,
      payout: systemConfig?.payoutCommissionRateForMember,
    };
  };

  async getAncestorsWithCommissionRates(teamId: string, memberId: number) {
    if (!teamId) return [];

    const teamMembers = await this.memberRepository.find({
      where: {
        teamId,
      },
      relations: ['agent', 'identity'],
    });

    const member = teamMembers.find((member) => member.id === memberId);
    if (!member) throw new Error('Member not found');

    const ancestors: {
      id: number;
      name: string;
      commissionRates: {
        payin: number | null;
        payout: number | null;
        topup: number | null;
      };
    }[] = [];

    const findParent = (agentId: number) =>
      teamMembers.find((m) => m.id === agentId);

    let currentMember = member;

    ancestors.push({
      id: currentMember.id,
      name: `${currentMember.firstName} ${currentMember.lastName}`,
      commissionRates: {
        payin: currentMember.agentCommissions?.payinCommissionRate ?? null,
        payout: currentMember.agentCommissions?.payoutCommissionRate ?? null,
        topup: currentMember.agentCommissions?.topupCommissionRate ?? null,
      },
    });

    while (currentMember?.agent?.id) {
      const parent = findParent(currentMember.agent.id);

      if (parent) {
        ancestors.push({
          id: parent.id,
          name: `${parent.firstName} ${parent.lastName}`,
          commissionRates: {
            payin: parent.agentCommissions?.payinCommissionRate ?? null,
            payout: parent.agentCommissions?.payoutCommissionRate ?? null,
            topup: parent.agentCommissions?.topupCommissionRate ?? null,
          },
        });
        currentMember = parent;
      } else {
        break;
      }
    }

    return ancestors.reverse();
  }

  async getTeamCommissionRate(teamId) {
    const team = await this.teamRepository.findOneBy({ teamId });
    return {
      payinRate: team.teamPayinCommissionRate,
      payoutRate: team.teamPayoutCommissionRate,
      topupRate: team.teamTopupCommissionRate,
    };
  }
}
