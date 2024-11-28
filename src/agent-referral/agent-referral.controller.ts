import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AgentReferralService } from './agent-referral.service';
import { CreateAgentReferralDto } from './dto/create-agent-referral.dto';
import { UpdateAgentReferralDto } from './dto/update-agent-referral.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';

@Controller('agent-referral')
@UseGuards(RolesGuard)
export class AgentReferralController {
  constructor(private readonly agentReferralService: AgentReferralService) {}

  @Post()
  @Roles(Role.ALL)
  create(@Body() createAgentReferralDto: CreateAgentReferralDto) {
    return this.agentReferralService.create(createAgentReferralDto);
  }

  @Get()
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  findAll() {
    return this.agentReferralService.findAll();
  }

  @Get('/tree')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.AGENT)
  getReferralTree() {
    return this.agentReferralService.getReferralTree();
  }

  @Get('/tree/:userId')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.AGENT)
  getReferralTreeOfUser(@Param('userId') userId: string) {
    return this.agentReferralService.getReferralTreeOfUser(userId);
  }

  @Get('/referral/:code')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.AGENT)
  findOneByCode(@Param('code') code: string) {
    return this.agentReferralService.findOneByCode(code);
  }

  @Get(':id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.AGENT)
  findOne(@Param('id') id: string) {
    return this.agentReferralService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.AGENT)
  update(
    @Param('id') id: string,
    @Body() updateAgentReferralDto: UpdateAgentReferralDto,
  ) {
    return this.agentReferralService.update(id, updateAgentReferralDto);
  }

  @Delete(':id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.agentReferralService.remove(id);
  }

  @Delete()
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  removeAll() {
    return this.agentReferralService.removeAll();
  }

  @Post('paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.AGENT)
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.agentReferralService.paginate(paginateRequestDto);
  }

  @Post('used-codes/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.AGENT)
  paginateUsedCodes(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.agentReferralService.paginate(paginateRequestDto, true);
  }
}
