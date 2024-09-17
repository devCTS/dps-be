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
} from '@nestjs/common';
import { AgentResponseDto } from './dto/agent-response.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AgentService } from './agent.service';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Controller('agent')
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Post()
  create(@Body() createAgentDto: CreateAgentDto): Promise<AgentResponseDto> {
    return this.agentService.create(createAgentDto);
  }

  @Get()
  findAll(): Promise<AgentResponseDto[]> {
    return this.agentService.findAll();
  }

  @Get('profile/:id')
  getProfile(@Param('id', ParseIntPipe) id: number): Promise<AgentResponseDto> {
    return this.agentService.getProfile(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AgentResponseDto> {
    return this.agentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto) {
    return this.agentService.update(+id, updateAgentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<HttpStatus> {
    return this.agentService.remove(+id);
  }

  //   @Post('paginate')
  //   paginate(@Body() paginateRequestDto: PaginateRequestDto) {
  //     return this.adminService.paginate(paginateRequestDto);
  //   }

  //   @Post('change-password/:id')
  //   changePassword(
  //     @Body() changePasswordDto: ChangePasswordDto,
  //     @Param('id', ParseIntPipe) id: number,
  //   ) {
  //     return this.identityService.changePassword(changePasswordDto, id);
  //   }
}
