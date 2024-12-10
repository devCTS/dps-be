import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from 'src/member/entities/member.entity';
import { Team } from './entities/team.entity';
import { TeamController } from './team.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Team])],
  providers: [TeamService],
  controllers: [TeamController],
  exports: [TeamService],
})
export class TeamModule {}
