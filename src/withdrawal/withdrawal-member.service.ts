import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Repository } from 'typeorm';
import { Member } from 'src/member/entities/member.entity';

@Injectable()
export class WithdrawalMemberService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async getChannelProfileDetails(id: number) {
    const member = await this.memberRepository.findOne({
      where: {
        id,
      },
      relations: [
        'identity',
        'identity.upi',
        'identity.netBanking',
        'identity.eWallet',
      ],
    });
    if (!member) throw new NotFoundException('Member not found!');

    const availableChannels: any = [];
    member.identity?.upi?.length && availableChannels.push('upi');
    member.identity?.netBanking?.length && availableChannels.push('netBanking');
    member.identity?.eWallet?.length && availableChannels.push('eWallet');

    const channelProfiles = availableChannels.map((el) => {
      return {
        channelName: el,
        channelDetails: member.identity[el],
      };
    });

    return {
      channelProfiles,
      minWithdrawal: member.minWithdrawalAmount,
      maxWithdrawal: member.maxWithdrawalAmount,
    };
  }
}
