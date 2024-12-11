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
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async createTeam(memberId: number) {
    const member = await this.memberRepository.findOneBy({ id: memberId });
    if (!member) throw new NotFoundException('Member not found.');

    const team = await this.teamRepository.findOne({
      where: {
        teamLeader: { id: member.id },
      },
      relations: ['teamLeader'],
    });
    if (team) throw new ConflictException('Team already exists.');

    const createdTeam = await this.teamRepository.save({ teamLeader: member });

    await this.memberRepository.update(member.id, {
      teamId: createdTeam.teamId,
    });

    return HttpStatus.CREATED;
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

    // query.andWhere('team.teamSize > 2');

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
      relations: ['agent'],
    });

    return this.buildTree(teamMembers);
  }

  buildTree(members: Member[]) {
    const rootMember = members.find((member) => !member.agent);

    const getChildren = (parentId: number): TreeNode[] => {
      const children = members.filter(
        (member) => member.agent?.id === parentId,
      );

      return children.map((obj) => ({
        id: obj.id,
        children: getChildren(obj.id),
        name: obj.firstName + ' ' + obj.lastName,
        isAgent: false,
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
      children: getChildren(rootMember.id),
      name: rootMember.firstName + ' ' + rootMember.lastName,
      isAgent: false,
      balance: null,
      quota: rootMember.quota,
      serviceRate: null,
      ratesOfAgent: {
        payin: rootMember.agentCommissions.payinCommissionRate,
        payout: rootMember.agentCommissions.payoutCommissionRate,
      },
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