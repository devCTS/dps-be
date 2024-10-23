import { ChannelName, GatewayName } from './../utils/enum/enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { channel } from 'diagnostics_channel';
import { Phonepe } from 'src/gateway/entities/phonepe.entity';
import { Razorpay } from 'src/gateway/entities/razorpay.entity';
import { Member } from 'src/member/entities/member.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentSystemUtilService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Phonepe)
    private readonly phonePeRepository: Repository<Phonepe>,
    @InjectRepository(Razorpay)
    private readonly razorpayRepository: Repository<Razorpay>,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async fetchForDefault(merchant, channelName) {
    // Both member and gateway are enabled
    if (merchant.allowMemberChannelsPayin && merchant.allowPgBackupForPayin) {
      let selectedMember;
      const payinTimeout = (await this.systemConfigService.findLatest())
        .payinTimeout;
      const startTime = Date.now();

      while (Date.now() - startTime < payinTimeout) {
        selectedMember = await this.getMemberForPayin(channelName);
        if (selectedMember) return selectedMember;

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // memer channels disabled
    if (!merchant.allowMemberChannelsPayin) {
      // fetch payin gateway
    }

    // gateway disabled
    if (!merchant.allowPgBackupForPayin) {
      // search for member channels without timeout
    }
  }

  async fetchForAmountRange(merchant) {
    const amountRanges = merchant.payinModeDetails.filter(
      (el) => el.amountRangeRange.length > 0,
    );

    amountRanges.forEach((range) => {
      console.log(range);
    });
  }

  async fetchForProportional(merchant) {
    const amountRatios = merchant.payinModeDetails.filter(
      (el) => el.proportionalRange.length > 0,
    );

    amountRatios.forEach((ratio) => {
      console.log(ratio);
    });
  }

  async getMemberForPayin(channelName) {
    const onlineMembers = await this.memberRepository.find({
      where: { isOnline: true },
      relations: [
        'identity',
        'identity.upi',
        'identity.netbanking',
        'identity.eWallet',
        'payin',
      ],
    });
    if (!onlineMembers || !onlineMembers.length) return null;

    const channelMap = {
      UPI: 'UPI',
      NetBanking: 'NET_BANKING',
      eWallet: 'E_WALLET',
    };

    const channelKey = channelMap[channelName];

    const membersWithSameChannel = onlineMembers.filter((member) => {
      return (
        member.identity[channelKey] && member.identity[channelKey].length > 0
      );
    });
    if (!membersWithSameChannel || !membersWithSameChannel.length) return null;

    const memberWithLeastPayinCount = membersWithSameChannel.reduce(
      (prev, curr) => {
        if (!prev) return curr;

        return prev.payin.length <= curr.payin.length ? prev : curr;
      },
      null,
    );

    return memberWithLeastPayinCount;
  }

  async getGatewayForPayin(priority = null) {
    if (priority) {
    } else {
      const defaultGateway = 'PHONEPE';
      if (defaultGateway === GatewayName.PHONEPE) {
      }
    }
  }
}
