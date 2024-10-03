import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AgentReferralService } from './agent-referral.service';
import { CreateAgentReferralDto } from './dto/create-agent-referral.dto';
import { UpdateAgentReferralDto } from './dto/update-agent-referral.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

@Controller('agent-referral')
export class AgentReferralController {
  constructor(private readonly agentReferralService: AgentReferralService) {}

  @Post()
  create(@Body() createAgentReferralDto: CreateAgentReferralDto) {
    return this.agentReferralService.create(createAgentReferralDto);
  }

  @Get()
  findAll() {
    return this.agentReferralService.findAll();
  }

  @Get('/tree')
  getReferralTree() {
    return this.agentReferralService.getReferralTree();
  }

  @Get('/referral/:code')
  findOneByCode(@Param('code') code: string) {
    return this.agentReferralService.findOneByCode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentReferralService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAgentReferralDto: UpdateAgentReferralDto,
  ) {
    return this.agentReferralService.update(+id, updateAgentReferralDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agentReferralService.remove(+id);
  }

  @Delete()
  removeAll() {
    return this.agentReferralService.removeAll();
  }

  @Post('paginate')
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.agentReferralService.paginate(paginateRequestDto);
  }

  @Post('used-codes/paginate')
  paginateUsedCodes(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.agentReferralService.paginate(paginateRequestDto, true);
  }
}
