import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Repository } from 'typeorm';
import { Agent } from 'src/agent/entities/agent.entity';

@Injectable()
export class WithdrawalAgentService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
  ) {}

  async getChannelProfileDetails(id: number) {
    const agent = await this.agentRepository.findOne({
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
    if (!agent) throw new NotFoundException('Agent not found!');

    const availableChannels: any = [];
    agent.identity?.upi?.length && availableChannels.push('upi');
    agent.identity?.netBanking?.length && availableChannels.push('netBanking');
    agent.identity?.eWallet?.length && availableChannels.push('eWallet');

    const channelProfiles = availableChannels.map((el) => {
      return {
        channelName: el,
        channelDetails: agent.identity[el],
      };
    });

    return {
      channelProfiles,
      minWithdrawal: agent.minWithdrawalAmount,
      maxWithdrawal: agent.maxWithdrawalAmount,
    };
  }
}
