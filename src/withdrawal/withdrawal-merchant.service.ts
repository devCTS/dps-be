import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Repository } from 'typeorm';
import { Merchant } from 'src/merchant/entities/merchant.entity';

@Injectable()
export class WithdrawalMerchantService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  async getChannelProfileDetails(id: number) {
    const merchant = await this.merchantRepository.findOne({
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
    if (!merchant) throw new NotFoundException('Merchant not found!');

    const availableChannels: any = [];
    merchant.identity?.upi?.length && availableChannels.push('upi');
    merchant.identity?.netBanking?.length &&
      availableChannels.push('netBanking');
    merchant.identity?.eWallet?.length && availableChannels.push('eWallet');

    const channelProfiles = availableChannels.map((el) => {
      return {
        channelName: el,
        channelDetails: merchant.identity[el],
      };
    });

    return {
      channelProfiles,
      minWithdrawal: merchant.minWithdrawal,
      maxWithdrawal: merchant.maxWithdrawal,
    };
  }
}
