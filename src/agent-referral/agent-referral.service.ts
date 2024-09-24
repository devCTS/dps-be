import {
  HttpStatus,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgentReferralDto } from './dto/create-agent-referral.dto';
import { UpdateAgentReferralDto } from './dto/update-agent-referral.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentReferral } from './entities/agent-referral.entity';
import { Between, ILike, Repository } from 'typeorm';
import { Agent } from 'src/agent/entities/agent.entity';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';

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
    if (!agent) throw new NotFoundException('Agent not found!');

    const referralCodeExists = await this.agentReferralRepository.findOneBy({
      referralCode,
    });
    if (referralCodeExists)
      throw new NotAcceptableException('This referral code already exists!');

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
    const results = await this.agentReferralRepository.find({
      relations: ['agent'],
    });

    return {
      status: 'success',
      length: results.length,
      data: results,
    };
  }

  async findOne(id: number) {
    const agentReferral = await this.agentReferralRepository.findOneBy({ id });

    return {
      status: 'success',
      data: agentReferral,
    };
  }

  async update(id: number, updateAgentReferralDto: UpdateAgentReferralDto) {
    const agentReferral = await this.agentReferralRepository.findOneBy({ id });
    if (!agentReferral) throw new NotFoundException();

    if (agentReferral)
      await this.agentReferralRepository.update(id, updateAgentReferralDto);

    return HttpStatus.OK;
  }

  async remove(id: number) {
    const agentReferral = await this.agentReferralRepository.findOneBy({ id });

    if (agentReferral) await this.agentReferralRepository.remove(agentReferral);

    return HttpStatus.OK;
  }

  async removeAll() {
    const agentReferrals = await this.agentReferralRepository.find({
      relations: ['agent', 'referredMerchant', 'referredAgent'],
    });

    if (agentReferrals)
      await this.agentReferralRepository.remove(agentReferrals);

    return HttpStatus.OK;
  }

  async paginate(paginateDto: PaginateRequestDto) {
    const { search, pageSize, pageNumber, startDate, endDate } = paginateDto;

    const whereConditions: any = {};

    if (search) whereConditions.referralCode = ILike(`%${search}%`);

    if (startDate && endDate) {
      const parsedStartDate = parseStartDate(startDate);
      const parsedEndDate = parseEndDate(endDate);
      whereConditions.createdAt = Between(parsedStartDate, parsedEndDate);
    }

    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const [rows, total] = await this.agentReferralRepository.findAndCount({
      where: whereConditions,
      relations: [
        'agent',
        'referredAgent',
        'referredMerchant',
        'agent.identity',
      ],
      skip,
      take,
    });

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
