import { identity } from 'rxjs';
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
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { TreeNode } from 'src/utils/enum/enum';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,

    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  //   TODO: number can be replace with string
  async createOrganization(leaderId: number) {
    const agent = await this.agentRepository.findOneBy({ id: leaderId });
    if (!agent) throw new NotFoundException('Agent not found.');

    const organisation = await this.organizationRepository.findOne({
      where: {
        leader: { id: leaderId },
      },
      relations: ['leader'],
    });

    if (organisation)
      throw new ConflictException('Organization already exists.');

    const createdOrganization = await this.organizationRepository.save({
      leader: agent,
    });

    await this.agentRepository.update(agent.id, {
      organizationId: createdOrganization.organizationId,
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
        `CONCAT(leader.first_name, ' ', leader.last_name, ' ', organization.organizationId) ILIKE :search`,
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

    // query.andWhere('organization.organizationSize > 2');

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

  async getOrganizationTree(organizationId: string) {
    const agentMembers = await this.agentRepository.find({
      where: {
        organizationId,
      },
      relations: ['agent', 'identity'],
    });

    const merchants = await this.merchantRepository.find({
      where: {
        organizationId,
      },
      relations: ['agent', 'identity'],
    });

    return this.buildTree([
      ...agentMembers,
      ...merchants.map((mer) => ({ ...mer, isMerchant: true })),
    ]);
  }

  buildTree(agents: any[]) {
    const rootAgent = agents.find((agent) => !agent.agent);

    const getChildren = (parentId: number): TreeNode[] => {
      const children = agents.filter((agent) => agent.agent?.id === parentId);

      return children.map((obj) => ({
        id: obj.id,
        children: getChildren(obj.id),
        name: obj.firstName + ' ' + obj.lastName,
        email: obj.identity?.email,
        isAgent: !obj.isMerchant,
        balance: obj.balance,
        quota: null,
        serviceRate: obj.isMerchant
          ? {
              payin: obj.payinServiceRate,
              payout: obj.payoutServiceRate,
            }
          : null,
        ratesOfAgent: {
          payin: obj.agentCommissions.payinCommissionRate,
          payout: obj.agentCommissions.payoutCommissionRate,
        },
        memberRates: null,
      }));
    };

    const tree: TreeNode = {
      id: rootAgent.id,
      children: getChildren(rootAgent.id),
      name: rootAgent.firstName + ' ' + rootAgent.lastName,
      email: rootAgent?.identity?.email,
      isAgent: true,
      balance: rootAgent.balance,
      quota: null,
      serviceRate: null,
      ratesOfAgent: null,
      memberRates: null,
    };

    return {
      tree,
      id: rootAgent.organizationId,
      name: tree.name,
    };
  }
}
