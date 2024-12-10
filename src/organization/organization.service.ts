import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization';
import { Agent } from 'src/agent/entities/agent.entity';
import {
  PaginateRequestDto,
  parseStartDate,
  parseEndDate,
} from 'src/utils/dtos/paginate.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,

    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  //   TODO: number can be replace with string
  async createOrganization(leaderId: number) {
    const agent = await this.agentRepository.findOneBy({ id: leaderId });
    if (!agent) throw new NotFoundException('Agent not found.');

    const organisation = await this.organizationRepository.findOne({
      where: {
        leader: agent,
      },
    });

    if (organisation)
      throw new ConflictException('Organization already exists.');

    await this.organizationRepository.save({
      leader: agent,
    });

    return HttpStatus.CREATED;
  }

  async paginate(paginateDto: PaginateRequestDto) {
    const query =
      this.organizationRepository.createQueryBuilder('organization');

    query.leftJoinAndSelect('organization.leader', 'leader');

    const search = paginateDto.search;
    const pageSize = paginateDto.pageSize;
    const pageNumber = paginateDto.pageNumber;

    if (search)
      query.andWhere(
        `CONCAT(leader.first_name, ' ', leader.last_name) ILIKE :search`,
        { search: `%${search}%` },
      );

    if (paginateDto.startDate && paginateDto.endDate) {
      const startDate = parseStartDate(paginateDto.startDate);
      const endDate = parseEndDate(paginateDto.endDate);

      query.andWhere(
        'organization.created_at BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    query
      .orderBy('organization.totalReferralCommission', 'ASC')
      .addOrderBy('organization.organizationSize', 'ASC');

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
