import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { IdentityService } from 'src/identity/identity.service';
import { Agent } from './entities/agent.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not } from 'typeorm';
import { AgentResponseDto } from './dto/agent-response.dto';
import { plainToInstance } from 'class-transformer';
import { UpdateAgentDto } from './dto/update-agent.dto';
import {
  PaginateRequestDto,
  parseEndDate,
  parseStartDate,
} from 'src/utils/dtos/paginate.dto';
import { JwtService } from 'src/services/jwt/jwt.service';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';
import { AgentReferralService } from 'src/agent-referral/agent-referral.service';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { Upi } from 'src/channel/entity/upi.entity';
import { NetBanking } from 'src/channel/entity/net-banking.entity';
import { EWallet } from 'src/channel/entity/e-wallet.entity';
import { identity } from 'rxjs';
import { VerifyWithdrawalPasswordDto } from './dto/verify-withdrawal-password.dto';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(Upi)
    private readonly upiRepository: Repository<Upi>,

    @InjectRepository(NetBanking)
    private readonly netBankingRepository: Repository<NetBanking>,

    @InjectRepository(EWallet)
    private readonly eWalletRepository: Repository<EWallet>,

    private identityService: IdentityService,
    private jwtService: JwtService,
    private agentReferralService: AgentReferralService,
  ) {}

  // Create Agent
  async create(createAgentDto: CreateAgentDto) {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      withdrawalPassword,
      referralCode,
      minWithdrawalAmount,
      maxWithdrawalAmount,
      withdrawalRate,
      channelProfile,
    } = createAgentDto;

    if (referralCode) {
      const isCodeValid = await this.agentReferralService.validateReferralCode(
        referralCode,
        'agent',
      );
      if (!isCodeValid) return;
    }

    const identity = await this.identityService.create(
      email,
      password,
      'AGENT',
    );

    // Create and save the Agent
    const agent = this.agentRepository.create({
      identity,
      firstName,
      lastName,
      phone,
      referralCode: referralCode ? referralCode : null,
      withdrawalPassword: this.jwtService.getHashPassword(withdrawalPassword),
      minWithdrawalAmount,
      maxWithdrawalAmount,
      withdrawalRate,
    });

    const created = await this.agentRepository.save(agent);

    if (channelProfile?.upi && channelProfile.upi.length > 0) {
      for (const element of channelProfile.upi) {
        await this.upiRepository.save({
          ...element,
          identity,
        });
      }
    }

    if (channelProfile?.eWallet && channelProfile.eWallet.length > 0) {
      for (const element of channelProfile.eWallet) {
        await this.eWalletRepository.save({
          ...element,
          identity,
        });
      }
    }

    if (channelProfile?.netBanking && channelProfile.netBanking.length > 0) {
      for (const element of channelProfile.netBanking) {
        await this.netBankingRepository.save({
          ...element,
          identity,
        });
      }
    }

    // Update Agent Referrals
    if (referralCode) {
      await this.agentReferralService.updateFromReferralCode({
        referralCode,
        referredAgent: created,
      });
    }

    return plainToInstance(AgentResponseDto, created);
  }

  // Find one by id
  async findOne(id: number): Promise<AgentResponseDto> {
    const results = await this.agentRepository.findOne({
      where: { id: id },
      relations: [
        'identity',
        'identity.upi',
        'identity.eWallet',
        'identity.netBanking',
      ],
    });

    return plainToInstance(AgentResponseDto, results);
  }

  // Find all agents
  async findAll(): Promise<AgentResponseDto[]> {
    const results = await this.agentRepository.find({
      relations: [
        'identity',
        'identity.upi',
        'identity.eWallet',
        'identity.netBanking',
      ],
    });

    return plainToInstance(AgentResponseDto, results);
  }

  // Get profile by id
  async getProfile(id: number) {
    const profile = await this.findOne(id);
    if (!profile.enabled) {
      throw new UnauthorizedException('Unauthorized.');
    }

    return profile;
  }

  // Update agent
  async update(
    id: number,
    updateAgentDto: UpdateAgentDto,
  ): Promise<HttpStatus> {
    const email = updateAgentDto.email;
    const password = updateAgentDto.password;
    const updateLoginCredentials = updateAgentDto.updateLoginCredentials;
    const channelProfile = updateAgentDto.channelProfile;

    delete updateAgentDto.email;
    delete updateAgentDto.password;
    delete updateAgentDto.updateLoginCredentials;
    delete updateAgentDto.channelProfile;

    const result = await this.agentRepository.update(
      { id: id },
      updateAgentDto,
    );

    const updatedAgent = await this.agentRepository.findOne({
      where: { id },
      relations: ['identity'], // Explicitly specify the relations
    });

    // Deleting all existing Data
    await this.upiRepository.delete({
      identity: {
        id: updatedAgent.identity.id,
      },
    });
    await this.eWalletRepository.delete({
      identity: {
        id: updatedAgent.identity.id,
      },
    });
    await this.netBankingRepository.delete({
      identity: {
        id: updatedAgent.identity.id,
      },
    });

    // Adding all the channels
    if (channelProfile?.upi && channelProfile.upi.length > 0) {
      for (const element of channelProfile.upi) {
        await this.upiRepository.save({
          ...element,
          identity: updatedAgent.identity,
        });
      }
    }

    if (channelProfile?.eWallet) {
      for (const element of channelProfile.eWallet) {
        await this.eWalletRepository.save({
          ...element,
          identity: updatedAgent.identity,
        });
      }
    }

    if (channelProfile?.netBanking) {
      for (const element of channelProfile.netBanking) {
        await this.netBankingRepository.save({
          ...element,
          identity: updatedAgent.identity,
        });
      }
    }

    if (updateLoginCredentials) {
      await this.identityService.updateLogin(
        updatedAgent.identity.id,
        email,
        password,
      );
    }

    return HttpStatus.OK;
  }

  // Remove agent by ID
  async remove(id: number): Promise<HttpStatus> {
    const agent = await this.agentRepository.findOne({
      where: { id: id },
      relations: ['identity'], // Ensure you load the identity relation
    });

    if (!agent) throw new NotFoundException();

    this.agentRepository.delete(id);
    this.identityService.remove(agent.identity?.id);

    return HttpStatus.OK;
  }

  // Paginate
  async paginate(paginateDto: PaginateRequestDto) {
    const query = this.agentRepository.createQueryBuilder('agent');
    // query.orderBy('agent.created_at', 'DESC');
    // Add relation to the identity entity
    query.leftJoinAndSelect('agent.identity', 'identity'); // Join with identity
    // .leftJoinAndSelect('identity.profile', 'profile'); // Join with profile through identity
    // Sort records by created_at from latest to oldest

    const search = paginateDto.search;
    const pageSize = paginateDto.pageSize;
    const pageNumber = paginateDto.pageNumber;
    const sortBy = paginateDto.sortBy;

    // Handle search by first_name + " " + last_name
    if (search) {
      query.andWhere(
        `CONCAT(agent.first_name, ' ', agent.last_name) ILIKE :search`,
        { search: `%${search}%` },
      );
    }

    // Handle filtering by created_at between startDate and endDate
    if (paginateDto.startDate && paginateDto.endDate) {
      const startDate = parseStartDate(paginateDto.startDate);
      const endDate = parseEndDate(paginateDto.endDate);

      query.andWhere('agent.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (sortBy)
      sortBy === 'latest'
        ? query.orderBy('agent.createdAt', 'DESC')
        : query.orderBy('agent.createdAt', 'ASC');

    // Handle pagination
    const skip = (pageNumber - 1) * pageSize;
    query.skip(skip).take(pageSize);

    // Execute query
    const [rows, total] = await query.getManyAndCount();
    const dtos = plainToInstance(AgentResponseDto, rows);

    const startRecord = skip + 1;
    const endRecord = Math.min(skip + pageSize, total);

    // Return paginated result
    return {
      data: dtos,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      startRecord,
      endRecord,
    };
  }

  async exportRecords(startDate: string, endDate: string) {
    startDate = parseStartDate(startDate);
    endDate = parseEndDate(endDate);

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const [rows, total] = await this.agentRepository.findAndCount({
      relations: ['identity'],
      where: {
        createdAt: Between(parsedStartDate, parsedEndDate),
      },
    });

    const dtos = plainToInstance(AgentResponseDto, rows);

    return {
      data: dtos,
      total,
    };
  }

  async changePassword(changePasswordDto: ChangePasswordDto, id: number) {
    const agentData = await this.agentRepository.findOne({
      where: { id },
      relations: ['identity'],
    });

    if (!agentData) throw new NotFoundException();

    return this.identityService.changePassword(
      changePasswordDto,
      agentData.identity.id,
    );
  }

  async changeWithdrawalPassword(
    changePasswordDto: ChangePasswordDto,
    id: number,
  ) {
    const agentData = await this.agentRepository.findOne({
      where: { id },
    });

    if (!agentData) throw new NotFoundException();

    const isPasswordCorrect = this.jwtService.isHashedPasswordVerified(
      changePasswordDto.oldPassword,
      agentData.withdrawalPassword,
    );

    if (!isPasswordCorrect) throw new UnauthorizedException();

    const newHashedPassword = this.jwtService.getHashPassword(
      changePasswordDto.newPassword,
    );

    await this.agentRepository.update(id, {
      withdrawalPassword: newHashedPassword,
    });

    return { message: 'Withdrawal password changed.' };
  }

  async updateBalance(identityId, systemOrderId, amount, failed) {
    const agent = await this.agentRepository.findOne({
      where: {
        identity: { id: identityId },
      },
      relations: ['identity'],
    });

    if (!agent) throw new NotFoundException('Agent not found!');

    await this.agentRepository.update(agent.id, {
      balance: agent.balance + amount,
    });

    const updatedAgent = await this.agentRepository.findOne({
      where: { identity: { id: identityId } },
      relations: ['identity'],
    });

    let whereCondition;
    whereCondition = {
      userType: UserTypeForTransactionUpdates.AGENT_BALANCE,
      user: { id: identityId },
      pending: true,
    };
    if (failed) whereCondition.systemOrderId = systemOrderId;
    else whereCondition.systemOrderId = Not(systemOrderId);

    const transactionUpdateAgents = await this.transactionUpdateRepository.find(
      {
        where: whereCondition,
        relations: ['user'],
      },
    );

    for (const transactionUpdateAgent of transactionUpdateAgents) {
      let beforeValue = updatedAgent.balance;
      let afterValue = failed ? updatedAgent.balance : amount + beforeValue;

      if (transactionUpdateAgent)
        if (failed)
          await this.transactionUpdateRepository.update(
            transactionUpdateAgent.id,
            {
              before: beforeValue,
              after: afterValue,
              amount: 0,
              rate: 0,
            },
          );
        else
          await this.transactionUpdateRepository.update(
            transactionUpdateAgent.id,
            {
              before: beforeValue,
              after: afterValue,
            },
          );
    }
  }

  async verifyWithdrawalPassword(
    verifyWithdrawalPasswordDto: VerifyWithdrawalPasswordDto,
    id: number,
  ) {
    const { password } = verifyWithdrawalPasswordDto;

    const merchant = await this.agentRepository.findOneBy({ id });

    if (!merchant) throw new NotFoundException('Agent not found.');

    return this.jwtService.isHashedPasswordVerified(
      password,
      merchant.withdrawalPassword,
    );
  }
}
