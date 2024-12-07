import { HttpStatus, Injectable } from '@nestjs/common';

import { IdentityService } from '../identity/identity.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Agent } from './entities/agent.entity';
import { Repository } from 'typeorm';
import { Users } from 'src/utils/enums/users';
import { plainToInstance } from 'class-transformer';
import { AgentDetailsDto } from './dto/response/agent-details.dto';
import { UpdateAgentDto } from './dto/request/update-agent.dto';
import { CreateAgentDto } from './dto/request/create-agent.dto';
import { JwtService } from 'src/integrations/jwt/jwt.service';

@Injectable()
export class AgentService {
  constructor(
    private readonly identityService: IdentityService,
    @InjectRepository(Agent) private readonly repository: Repository<Agent>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createAgentDto: CreateAgentDto) {
    const identity = await this.identityService.createNewUser(
      Users.AGENT,
      createAgentDto,
    );

    const hashedPassword = this.jwtService.getHashPassword(
      createAgentDto.withdrawalPassword,
    );

    const newAgentData: Partial<Agent> = {
      identity: identity,
      ...this.identityService.getDataBodyWithoutIdentity(createAgentDto),
      withdrawalPassword: hashedPassword,
    };

    const created = this.repository.create(newAgentData);
    await this.repository.save(created);

    return HttpStatus.CREATED;
  }

  async update(id: string, updateAgentDto: UpdateAgentDto) {
    const identity = await this.identityService.updateUser(id, updateAgentDto);

    const newAgentData: Partial<Agent> = {
      identity: identity,
      ...this.identityService.getDataBodyWithoutIdentity(updateAgentDto),
    };

    if (updateAgentDto.withdrawalPassword) {
      const hashedPassword = this.jwtService.getHashPassword(
        updateAgentDto.withdrawalPassword,
      );
      await this.repository.update(
        { identity: { id } },
        { ...newAgentData, withdrawalPassword: hashedPassword },
      );
    } else {
      await this.repository.update({ identity: { id } }, newAgentData);
    }

    return HttpStatus.OK;
  }

  async findAll() {
    const results = await this.repository.find({ relations: ['identity'] });
    return plainToInstance(AgentDetailsDto, results);
  }
}
