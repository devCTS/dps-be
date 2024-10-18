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
import { Repository, Between } from 'typeorm';
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

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,

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
    });

    const created = await this.agentRepository.save(agent);

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
      relations: ['identity'],
    });

    return plainToInstance(AgentResponseDto, results);
  }

  // Find all agents
  async findAll(): Promise<AgentResponseDto[]> {
    const results = await this.agentRepository.find({
      relations: ['identity'],
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

    delete updateAgentDto.email;
    delete updateAgentDto.password;
    delete updateAgentDto.updateLoginCredentials;

    const result = await this.agentRepository.update(
      { id: id },
      updateAgentDto,
    );

    if (updateLoginCredentials) {
      const hashedPassword = this.jwtService.getHashPassword(password);

      const updatedAgent = await this.agentRepository.findOne({
        where: { id },
        relations: ['identity'], // Explicitly specify the relations
      });

      await this.identityService.updateLogin(
        updatedAgent.identity.id,
        email,
        hashedPassword,
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

  async updateBalance(identityId, amount, failed) {
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

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          user: { id: identityId },
          pending: true,
        },
        relations: ['user'],
      });

    for (const entry of transactionUpdateEntries) {
      let beforeValue = agent.balance;
      let afterValue = 0;

      if (entry.userType === UserTypeForTransactionUpdates.AGENT_BALANCE)
        afterValue = agent.balance + amount;

      if (failed) afterValue = agent.balance;

      await this.transactionUpdateRepository.update(entry.user?.id, {
        before: beforeValue,
        after: afterValue,
      });
    }
  }
}
