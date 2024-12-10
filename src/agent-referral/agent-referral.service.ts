import { identity } from 'rxjs';
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
import { Between, ILike, In, Not, Repository } from 'typeorm';
import { Agent } from 'src/agent/entities/agent.entity';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { Merchant } from 'src/merchant/entities/merchant.entity';

@Injectable()
export class AgentReferralService {
  referralLimit = 5;

  constructor(
    @InjectRepository(AgentReferral)
    private readonly agentReferralRepository: Repository<AgentReferral>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
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

    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
    });
    if (!agent) throw new NotFoundException('Agent not found!');

    const currentReferralCount = await this.agentReferralRepository.count({
      where: {
        agent: { id: agent.id },
        status: In(['pending', 'utilized']),
      },
      relations: ['agent'],
    });

    if (currentReferralCount >= this.referralLimit)
      throw new NotAcceptableException(
        `Your referral limit of ${this.referralLimit} is completed!`,
      );

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
        status: 'pending',
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
      relations: ['agent', 'referredMerchant', 'referredAgent'],
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
    merchantPayinServiceRate = null,
    merchantPayoutServiceRate = null,
    referredMerchant = null,
    referredAgent = null,
  }) {
    const agentReferral = await this.agentReferralRepository.findOne({
      where: { referralCode },
    });

    if (!agentReferral)
      throw new NotFoundException('Agent Referral not found!');

    const updateData = {
      status: 'utilized',
      ...(merchantPayinServiceRate !== null && { merchantPayinServiceRate }),
      ...(merchantPayoutServiceRate !== null && { merchantPayoutServiceRate }),
      referredAgent,
      referredMerchant,
    };

    const updated = await this.agentReferralRepository.update(
      agentReferral.id,
      updateData,
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
    const { search, pageSize, pageNumber, startDate, endDate, userId, sortBy } =
      paginateDto;

    const whereConditions: any = {};

    if (showUsedCodes) whereConditions.status = 'utilized';

    if (userId) whereConditions.agent = { id: userId };

    if (search) whereConditions.referralCode = ILike(`%${search}%`);

    if (startDate && endDate) {
      const parsedStartDate = parseStartDate(startDate);
      const parsedEndDate = parseEndDate(endDate);
      whereConditions.createdAt = Between(parsedStartDate, parsedEndDate);
    }

    let orderConditions: any = {};
    if (sortBy)
      if (sortBy === 'latest') {
        orderConditions['createdAt'] = 'DESC';
      } else {
        orderConditions['createdAt'] = 'ASC';
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
      order: orderConditions,
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
  // async getReferralTree(): Promise<any> {
  //   const rootReferral = await this.agentReferralRepository.findOne({
  //     where: {
  //       referralCode: null,
  //       status: 'utilized',
  //     },
  //     relations: ['agent', 'agent.identity'],
  //   });

  //   if (!rootReferral) return null;

  //   const rootAgent = rootReferral.agent;
  //   return this.buildTree(rootAgent);
  // }

  // // Recursive method to build the tree structure
  // private async buildTree(agent: any): Promise<any> {
  //   const referrals = await this.agentReferralRepository.find({
  //     where: {
  //       agent: { id: agent.id },
  //       status: 'utilized',
  //     },
  //     relations: [
  //       'agent',
  //       'agent.identity',
  //       'referredAgent',
  //       'referredAgent.identity',
  //       'referredMerchant',
  //       'referredMerchant.identity',
  //     ],
  //   });

  //   const children = await Promise.all(
  //     referrals.map(async (referral) => {
  //       if (referral.referredAgent) {
  //         let childTree = {};
  //         if (!agent.integrationId)
  //           childTree = await this.buildTree(referral.referredAgent);
  //         else return null;
  //         return {
  //           payinCommission: referral.payinCommission,
  //           payoutCommission: referral.payoutCommission,
  //           balance: referral.referredAgent.balance,
  //           uniqueId: referral.referredAgent.identity.id,
  //           ...childTree,
  //         };
  //       } else if (referral.referredMerchant) {
  //         let childTree = {};
  //         if (!agent.integrationId)
  //           childTree = await this.buildTree(referral.referredMerchant);
  //         else return null;
  //         return {
  //           payinCommission: referral.payinCommission,
  //           payoutCommission: referral.payoutCommission,
  //           merchantPayinServiceRate: referral.merchantPayinServiceRate,
  //           merchantPayoutServiceRate: referral.merchantPayoutServiceRate,
  //           balance: referral.referredMerchant.balance,
  //           uniqueId: referral.referredMerchant.identity.id,
  //           ...childTree,
  //         };
  //       } else {
  //         return null;
  //       }
  //     }),
  //   );

  //   return {
  //     id: agent.id,
  //     uniqueId: agent.identity.id,
  //     firstName: agent.firstName,
  //     lastName: agent.lastName,
  //     referralCode: agent.referralCode,
  //     email: agent.identity.email,
  //     agentType: agent.integrationId ? 'merchant' : 'agent',
  //     balance: agent.balance,
  //     payinCommission:
  //       referrals.length > 0 ? referrals[0].payinCommission : null,
  //     payoutCommission:
  //       referrals.length > 0 ? referrals[0].payoutCommission : null,
  //     children: children.filter((child) => child !== null),
  //   };
  // }

  // async getReferralTreeOfUser(userId: number) {
  //   const referralTree = await this.getReferralTree();
  //   if (!referralTree) {
  //     const merchant = await this.merchantRepository.findOne({
  //       where: { identity: { id: userId } },
  //       relations: ['identity'],
  //     });
  //     if (!merchant) return null;

  //     return {
  //       id: merchant.id,
  //       firstName: merchant.firstName,
  //       lastName: merchant.lastName,
  //       referralCode: merchant.referralCode,
  //       email: merchant.identity.email,
  //       agentType: 'merchant',
  //       balance: merchant.balance,
  //       merchantPayinServiceRate: merchant.payinServiceRate,
  //       merchantPayoutServiceRate: merchant.payoutServiceRate,
  //       children: [],
  //     };
  //   }
  //   return await this.trimTreeToUser(referralTree, userId);
  // }

  // private async trimTreeToUser(tree: any, userId: number): Promise<any> {
  //   if (tree.uniqueId === userId)
  //     return {
  //       id: tree.id,
  //       firstName: tree.firstName,
  //       lastName: tree.lastName,
  //       referralCode: tree.referralCode,
  //       email: tree.email,
  //       agentType: 'merchant',
  //       balance: tree.balance,
  //       merchantPayinServiceRate: tree.merchantPayinServiceRate,
  //       merchantPayoutServiceRate: tree.merchantPayoutServiceRate,
  //       payinCommission: tree.payinCommission,
  //       payoutCommission: tree.payoutCommission,
  //       children: [],
  //     };

  //   const trimmedChildren = await Promise.all(
  //     tree.children.map((child: any) => this.trimTreeToUser(child, userId)),
  //   );

  //   if (trimmedChildren.length > 0)
  //     return {
  //       ...tree,
  //       children: trimmedChildren,
  //     };

  //   const merchant = await this.merchantRepository.findOne({
  //     where: { identity: { id: userId } },
  //     relations: ['identity'],
  //   });
  //   if (!merchant) return null;

  //   return {
  //     id: merchant.id,
  //     firstName: merchant.firstName,
  //     lastName: merchant.lastName,
  //     referralCode: merchant.referralCode,
  //     email: merchant.identity.email,
  //     agentType: 'merchant',
  //     balance: merchant.balance,
  //     merchantPayinServiceRate: merchant.payinServiceRate,
  //     merchantPayoutServiceRate: merchant.payoutServiceRate,
  //     children: [],
  //   };
  // }
}
