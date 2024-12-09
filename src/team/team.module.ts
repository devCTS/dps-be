import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from 'src/member/entities/member.entity';
import { Team } from './entities/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Team])],
  providers: [TeamService],
})
export class TeamModule {}
