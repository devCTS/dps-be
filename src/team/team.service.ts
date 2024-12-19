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

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
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

  buildTree(members: Member[]) {
    const rootMember = members.find((member) => !member.agent);

    const getChildren = (
      parentId: number,
      ancestorsOfParent: number[],
    ): TreeNode[] => {
      const children = members.filter(
        (member) => member.agent?.id === parentId,
      );

      return children.map((obj) => ({
        id: obj.id,
        children: getChildren(obj.id, [...ancestorsOfParent, parentId]),
        name: obj.firstName + ' ' + obj.lastName,
        email: obj.identity?.email,
        isAgent: false,
        ancestors: [...ancestorsOfParent, parentId],
        balance: null,
        quota: obj.quota,
        serviceRate: null,
        ratesOfAgent: {
          payin: obj.agentCommissions.payinCommissionRate,
          payout: obj.agentCommissions.payoutCommissionRate,
        },
        memberRates: {
          payin: obj.payinCommissionRate,
          payout: obj.payoutCommissionRate,
        },
      }));
    };

    const tree: TreeNode = {
      id: rootMember.id,
      children: getChildren(rootMember.id, []),
      name: rootMember.firstName + ' ' + rootMember.lastName,
      email: rootMember.identity?.email,
      isAgent: false,
      ancestors: [],
      balance: null,
      quota: rootMember.quota,
      serviceRate: null,
      ratesOfAgent: null,
      memberRates: {
        payin: rootMember.payinCommissionRate,
        payout: rootMember.payoutCommissionRate,
      },
    };

    return {
      tree,
      id: rootMember.teamId,
      name: tree.name,
    };
  }
}
