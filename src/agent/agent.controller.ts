import { Body, Controller, Post } from '@nestjs/common';
import { AgentResponseDto } from './dto/agent-response.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Post()
  create(@Body() createAgentDto: CreateAgentDto): Promise<AgentResponseDto> {
    return this.agentService.create(createAgentDto);
  }
  //     @Post()
  //   create(@Body() createAdminDto: CreateAdminDto): Promise<AdminResponseDto> {
  //     return this.adminService.create(createAdminDto);
  //   }
  //   @Get()
  //   findAll() {
  //     return this.adminService.findAll();
  //   }
  //   @Get('profile/:id')
  //   getProfile(@Param('id', ParseIntPipe) id: number) {
  //     return this.adminService.getProfile(id);
  //   }
  //   @Get(':id')
  //   findOne(@Param('id') id: string) {
  //     return this.adminService.findOne(+id);
  //   }
  //   @Patch(':id')
  //   update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
  //     return this.adminService.update(+id, updateAdminDto);
  //   }
  //   @Delete(':id')
  //   remove(@Param('id') id: string) {
  //     return this.adminService.remove(+id);
  //   }
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
