import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AgentResponseDto } from './dto/agent-response.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AgentService } from './agent.service';
import { UpdateAgentChannelDto, UpdateAgentDto } from './dto/update-agent.dto';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { ChangePasswordDto } from 'src/identity/dto/changePassword.dto';
import { IdentityService } from 'src/identity/identity.service';
import { VerifyWithdrawalPasswordDto } from './dto/verify-withdrawal-password.dto';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';

@Controller('agent')
@UseGuards(RolesGuard)
export class AgentController {
  constructor(
    private identityService: IdentityService,
    private agentService: AgentService,
  ) {}

  @Post()
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  create(@Body() createAgentDto: CreateAgentDto): Promise<AgentResponseDto> {
    return this.agentService.create(createAgentDto);
  }

  // @Get()
  // @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  // findAll(): Promise<AgentResponseDto[]> {
  //   return this.agentService.findAll();
  // }

  @Get()
  @Roles(Role.AGENT)
  getProfile(@UserInReq() user): Promise<AgentResponseDto> {
    return this.agentService.findOne(user.id);
  }

  @Patch('channels')
  @UseGuards(RolesGuard)
  @Roles(Role.AGENT)
  updateAgentChannels(
    @UserInReq() user,
    @Body() updateAgentChannelDto: UpdateAgentChannelDto,
  ) {
    return this.agentService.updateChannels(+user.id, updateAgentChannelDto);
  }

  @Get(':id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  findOne(@Param('id') id: string): Promise<AgentResponseDto> {
    return this.agentService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  updateAgent(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto) {
    return this.agentService.update(+id, updateAgentDto);
  }

  @Delete(':id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id') id: string): Promise<HttpStatus> {
    return this.agentService.remove(+id);
  }

  @Post('paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.agentService.paginate(paginateRequestDto);
  }

  @Post('change-password')
  @Roles(Role.AGENT)
  changePassword(
    @UserInReq() user,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.agentService.changePassword(changePasswordDto, user.id);
  }

  @Post('change-withdrawal-password')
  @Roles(Role.AGENT)
  changeWithdrawalPassword(
    @UserInReq() user,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.agentService.changeWithdrawalPassword(
      changePasswordDto,
      user.id,
    );
  }

  @Post('verify-withdrawal-password')
  @Roles(Role.AGENT)
  verifyWithdrawalPassword(
    @UserInReq() user,
    @Body() verifyWithdrawalPasswordDto: VerifyWithdrawalPasswordDto,
  ) {
    return this.agentService.verifyWithdrawalPassword(
      verifyWithdrawalPasswordDto,
      user.id,
    );
  }
}
