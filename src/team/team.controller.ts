import { Body, Controller, Post } from '@nestjs/common';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @Post()
  async createTeam(@Body() body: { memberId: number }) {
    return this.teamService.createTeam(body.memberId);
  }
}
