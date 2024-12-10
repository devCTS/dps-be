import { Body, Controller, Post } from '@nestjs/common';
import { TeamService } from './team.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Post()
  async createTeam(@Body() body: { memberId: number }) {
    return this.teamService.createTeam(body.memberId);
  }

  @Post('paginate')
  async paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.teamService.paginate(paginateRequestDto);
  }
}
