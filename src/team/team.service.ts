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

  //   TODO: member id can be changed with string
  async createTeam(memberId: number) {
    const member = await this.memberRepository.findOneBy({ id: memberId });
    if (!member) throw new NotFoundException('Member not found.');

    const team = await this.teamRepository.findOne({
      where: {
        teamLeader: member,
      },
    });
    if (team) throw new ConflictException('Team already exists.');

    await this.teamRepository.save({ teamLeader: member });

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
        `CONCAT(teamLeader.first_name, ' ', teamLeader.last_name) ILIKE :search`,
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
}
