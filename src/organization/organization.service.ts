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
}
