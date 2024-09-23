import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAgentReferralDto } from './dto/create-agent-referral.dto';
import { UpdateAgentReferralDto } from './dto/update-agent-referral.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentReferral } from './entities/agent-referral.entity';
import { Repository } from 'typeorm';
import { Agent } from 'src/agent/entities/agent.entity';
import { NotFoundError } from 'rxjs';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { plainToInstance } from 'class-transformer';
import { AdminResponseDto } from 'src/admin/dto/admin-response.dto';

@Injectable()
export class AgentReferralService {
  constructor(
    @InjectRepository(AgentReferral)
    private readonly agentReferralRepository: Repository<AgentReferral>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
  ) {}

  async create(createAgentReferralDto: CreateAgentReferralDto) {
    const {
      agentType,
      payinCommission,
      payoutCommission,
      merchantPayinServiceRate,
      merchantPayoutServiceRate,
      referralCode,
      agentId,
    } = createAgentReferralDto;

    const agent = await this.agentRepository.findOneBy({ id: agentId });
    if (!agent) throw new NotFoundException();

    await this.agentReferralRepository.save({
      agent,
      referralCode,
      agentType,
      payinCommission,
      payoutCommission,
      merchantPayinServiceRate,
      merchantPayoutServiceRate,
    });

    return HttpStatus.CREATED;
  }

  async findAll() {
    const results = await this.agentReferralRepository.find();

    return {
      status: 'success',
      length: results.length,
      data: results,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} agentReferral`;
  }

  async update(id: number, updateAgentReferralDto: UpdateAgentReferralDto) {
    await this.agentReferralRepository.update(id, updateAgentReferralDto);
  }

  remove(id: number) {
    return `This action removes a #${id} agentReferral`;
  }

  async paginate(paginateDto: PaginateRequestDto) {
    const query =
      this.agentReferralRepository.createQueryBuilder('agentReferral');

    query.leftJoinAndSelect('agentReferral.agent', 'agent');

    const search = paginateDto.search;
    const pageSize = paginateDto.pageSize;
    const pageNumber = paginateDto.pageNumber;

    if (search) {
      query.andWhere(`CONCAT(agentReferral.referral_code) ILIKE :search`, {
        search: `%${search}%`,
      });
    }

    if (paginateDto.startDate && paginateDto.endDate) {
      const startDate = parseStartDate(paginateDto.startDate);
      const endDate = parseEndDate(paginateDto.endDate);

      query.andWhere(
        'agentReferral.created_at BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    const skip = (pageNumber - 1) * pageSize;
    query.skip(skip).take(pageSize);

    const [rows, total] = await query.getManyAndCount();

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    return {
      data: rows,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
    };
  }
}
