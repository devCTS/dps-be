import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TeamService } from './team.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { UpdateTeamCommissionsDto } from './dto/update-commissions.dto';

@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Post('paginate')
  async paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.teamService.paginate(paginateRequestDto);
  }

  @Get(':id')
  async getTeamTree(@Param('id') id: string) {
    return this.teamService.getTeamTree(id);
  }

  @Patch('update-commission-rates/:id')
  async updateTeamCommissionRates(
    @Param('id') id: string,
    @Body() body: UpdateTeamCommissionsDto,
  ) {
    return this.teamService.updateTeamCommissionRates(id, body);
  }
}
