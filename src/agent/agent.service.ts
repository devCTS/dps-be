import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { IdentityService } from 'src/identity/identity.service';
import { Agent } from './entities/agent.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentResponseDto } from './dto/agent-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
    private identityService: IdentityService,
  ) {}

  // Create Agent
  async create(createAgentDto: CreateAgentDto) {
    const { email, password, firstName, lastName, phone } = createAgentDto;

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
    });

    const created = await this.agentRepository.save(agent);

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

    return profile;
  }
}
