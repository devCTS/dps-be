import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
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

  async validateReferralCode(referralCode, agentType) {
    const isValidCode = await this.agentReferralRepository.findOne({
      where: {
        referralCode,
        agentType,
        status: 'approved',
      },
    });

    if (!isValidCode)
      throw new NotAcceptableException(
        'This referral code is invalid or not acceptable!',
      );

    return true;
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

  async findOneByCode(referralCode: string) {
    const agentReferral = await this.agentReferralRepository.findOneBy({
      referralCode,
    });

    if (!agentReferral) throw new NotFoundException('Referral not found!');

    return agentReferral;
  }

  async update(id: number, updateAgentReferralDto: UpdateAgentReferralDto) {
    const agentReferral = await this.agentReferralRepository.findOneBy({ id });
    if (!agentReferral) throw new NotFoundException();

    if (agentReferral)
      await this.agentReferralRepository.update(id, updateAgentReferralDto);

    return HttpStatus.OK;
  }

  async updateFromReferralCode({
    referralCode,
    referredMerchant = null,
    referredAgent = null,
  }) {
    const agentReferral = await this.agentReferralRepository.findOne({
      where: { referralCode },
    });

    if (!agentReferral)
      throw new NotFoundException('Agent Referral not found!');

    const updated = await this.agentReferralRepository.update(
      agentReferral.id,
      {
        status: 'utilized',
        referredMerchant,
        referredAgent,
      },
    );

    if (!updated)
      throw new InternalServerErrorException(
        'Failed to update referrals entity!',
      );
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

  async paginate(paginateDto: PaginateRequestDto, showUsedCodes = false) {
    const { search, pageSize, pageNumber, startDate, endDate, userId } =
      paginateDto;

    const whereConditions: any = {};

    if (showUsedCodes) whereConditions.status = 'utilized';

    if (userId) whereConditions.agent = userId;

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
        'referredAgent.identity',
        'referredMerchant.identity',
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

  // Method to fetch and build the referral tree starting from the root member
  async getReferralTree(): Promise<any> {
    const rootReferral = await this.agentReferralRepository.findOne({
      where: {
        referralCode: null,
        status: 'utilized',
      },
      relations: ['agent', 'agent.identity'],
    });

    if (!rootReferral) throw new NotFoundException('No root agent found');

    const rootAgent = rootReferral.agent;
    return this.buildTree(rootAgent);
  }

  // Recursive method to build the tree structure
  private async buildTree(agent: any): Promise<any> {
    const referrals = await this.agentReferralRepository.find({
      where: {
        agent: { id: agent.id },
        status: 'utilized',
      },
      relations: [
        'agent',
        'agent.identity',
        'referredAgent',
        'referredAgent.identity',
        'referredMerchant',
        'referredMerchant.identity',
      ],
    });

    const children = await Promise.all(
      referrals.map(async (referral) => {
        if (referral.referredAgent) {
          const childTree = await this.buildTree(referral.referredAgent);

          return {
            payinCommission: referral.payinCommission,
            payoutCommission: referral.payoutCommission,
            ...childTree,
          };
        } else if (referral.referredMerchant) {
          const childTree = await this.buildTree(referral.referredMerchant);
          return {
            payinCommission: referral.payinCommission,
            payoutCommission: referral.payoutCommission,
            merchantPayinServiceRate: referral.merchantPayinServiceRate,
            merchantPayoutServiceRate: referral.merchantPayoutServiceRate,
            ...childTree,
          };
        } else {
          return null;
        }
      }),
    );

    return {
      id: agent.id,
      firstName: agent.firstName,
      lastName: agent.lastName,
      referralCode: agent.referralCode,
      email: agent.identity.email,
      children: children,
      agentType: agent.integrationId ? 'merchant' : 'agent',
    };
  }
}
