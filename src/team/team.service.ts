import {
  ConflictException,
  HttpCode,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Repository } from 'typeorm';
import { Member } from 'src/member/entities/member.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  //   TODO: member id can be changed with string
  async createTeam(memberId: number) {
    const member = await this.memberRepository.findOneBy({ id: memberId });

    if (!member) throw new NotFoundException('Team leader not found.');

    const team = await this.teamRepository.findOne({
      where: {
        teamLeader: member,
      },
    });

    if (team) throw new ConflictException('Team already exists.');

    await this.teamRepository.save({ teamLeader: member });

    return HttpStatus.CREATED;
  }
}
