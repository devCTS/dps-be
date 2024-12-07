import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { IdentityService } from '../identity/identity.service';
import { CreateAgentDto } from './dto/request/create-agent.dto';
import { UpdateAgentDto } from './dto/request/update-agent.dto';

@Controller('agent')
export class AgentController {
  constructor(
    private readonly service: AgentService,
    private readonly identityService: IdentityService,
  ) {}

  @Post()
  create(@Body() createAgentDto: CreateAgentDto) {
    return this.service.create(createAgentDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.identityService.getUserDetails(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto) {
    return this.service.update(id, updateAgentDto);
  }
}
