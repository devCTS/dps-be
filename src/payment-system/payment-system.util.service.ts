import { identity } from 'rxjs';
import { Phonepe } from './../gateway/entities/phonepe.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelSettings } from 'src/gateway/entities/channel-settings.entity';
import { Razorpay } from 'src/gateway/entities/razorpay.entity';
import { Member } from 'src/member/entities/member.entity';
import { AmountRangePayinMode } from 'src/merchant/entities/amountRangePayinMode.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { ProportionalPayinMode } from 'src/merchant/entities/proportionalPayinMode.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { ChannelName, GatewayName } from 'src/utils/enum/enum';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentSystemUtilService {
  private selectGateway = false;

  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Phonepe)
    private readonly phonePeRepository: Repository<Phonepe>,
    @InjectRepository(Razorpay)
    private readonly razorpayRepository: Repository<Razorpay>,
    @InjectRepository(ChannelSettings)
    private readonly channelSettingsRepository: Repository<ChannelSettings>,
    @InjectRepository(AmountRangePayinMode)
    private readonly amountRangeRepository: Repository<AmountRangePayinMode>,
    @InjectRepository(ProportionalPayinMode)
    private readonly proportionalRepository: Repository<ProportionalPayinMode>,

    private readonly systemConfigService: SystemConfigService,
  ) {}

  async fetchForDefault(merchant, channelName, amount) {
    // Both member and gateway are enabled
    if (merchant.allowMemberChannelsPayin && merchant.allowPgBackupForPayin) {
      let selectedMember;
      const payinTimeout =
        (await this.systemConfigService.findLatest()).payinTimeout * 1000;
      const startTime = Date.now();

      while (Date.now() - startTime < payinTimeout) {
        selectedMember = await this.getMemberForPayin(channelName, amount);
        if (selectedMember) return selectedMember;

        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (!selectedMember)
        selectedMember = await this.getGatewayForPayin(channelName, amount);
      return selectedMember;
    }

    // gateway disabled
    if (!merchant.allowPgBackupForPayin) {
      let selectedMember;
      while (true) {
        selectedMember = await this.getMemberForPayin(channelName, amount);
        if (selectedMember) return selectedMember;

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // member channels disabled
    if (!merchant.allowMemberChannelsPayin)
      return await this.getGatewayForPayin(channelName, amount);
  }

  async fetchForAmountRange(merchant: Merchant, channelName, payinAmount) {
    const amountRanges = await this.amountRangeRepository.find({
      where: {
        payinMode: {
          merchant: {
            id: merchant.id,
          },
        },
      },
      relations: ['payinMode', 'payinMode.merchant'],
    });

    let selectedGateway;
    for (const range of amountRanges)
      if (payinAmount >= range.lower && payinAmount <= range.upper)
        selectedGateway = range.gateway;

    if (selectedGateway === GatewayName.RAZORPAY)
      return await this.getGatewayForPayin(
        channelName,
        payinAmount,
        GatewayName.RAZORPAY,
      );
    else if (selectedGateway === GatewayName.PHONEPE)
      return await this.getGatewayForPayin(
        channelName,
        payinAmount,
        GatewayName.PHONEPE,
      );
    else return await this.getMemberForPayin(channelName, payinAmount);
  }

  async fetchForProportional(merchant: Merchant, channelName, amount) {
    const ratios = await this.proportionalRepository.find({
      where: {
        payinMode: {
          merchant: {
            id: merchant.id,
          },
        },
      },
      relations: ['payinMode', 'payinMode.merchant'],
    });

    // Get ratios
    const razorpayRatio = ratios.find(
      (ratio) => ratio.gateway === 'gateway',
    ).ratio;
    const phonepayRatio = ratios.find(
      (ratio) => ratio.gateway === 'phonepay',
    ).ratio;
    const memberRatio = ratios.find(
      (ratio) => ratio.gateway === 'member',
    ).ratio;

    const baseRatio = ratios.reduce((sum, ratio) => sum + ratio.ratio, 0);
    const totalPayins = merchant.payin?.length;
    const totalMemberPayins = merchant.payin.filter(
      (payin) => payin.member,
    ).length;
    const totalRazorpayPayins = merchant.payin.filter(
      (payin) => payin.gatewayName === GatewayName.RAZORPAY,
    ).length;
    const totalPhonepePayins = merchant.payin.filter(
      (payin) => payin.gatewayName === GatewayName.PHONEPE,
    ).length;

    const desiredMemberOrders = Math.round(
      memberRatio * (totalPayins / baseRatio),
    );
    const desiredRazorpayOrders = Math.round(
      razorpayRatio * (totalPayins / baseRatio),
    );
    const desiredPhonepeOrders = Math.round(
      phonepayRatio * (totalPayins / baseRatio),
    );

    const memberDiff = desiredMemberOrders - totalMemberPayins;
    const razorpayDiff = desiredRazorpayOrders - totalRazorpayPayins;
    const phonepeDiff = desiredPhonepeOrders - totalPhonepePayins;

    const diffs = [
      { name: 'member', diff: memberDiff, total: totalMemberPayins },
      { name: 'razorpay', diff: razorpayDiff, total: totalRazorpayPayins },
      { name: 'phonepe', diff: phonepeDiff, total: totalPhonepePayins },
    ];

    const maxDiff = Math.max(memberDiff, razorpayDiff, phonepeDiff);

    const maxDiffOptions = diffs.filter((diff) => diff.diff === maxDiff);

    const selected = maxDiffOptions.reduce((prev, current) => {
      return prev.total < current.total ? prev : current;
    });

    if (selected.name === 'member')
      return await this.getMemberForPayin(channelName, amount);

    if (selected.name === 'razorpay')
      return await this.getGatewayForPayin(
        channelName,
        amount,
        GatewayName.RAZORPAY,
      );

    if (selected.name === 'phonepe')
      return await this.getGatewayForPayin(
        channelName,
        amount,
        GatewayName.PHONEPE,
      );
  }

  async getMemberForPayin(channelName, amount) {
    const eligibleMembers = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.identity', 'identity')
      .leftJoinAndSelect('identity.netBanking', 'netBanking')
      .leftJoinAndSelect('identity.eWallet', 'eWallet')
      .leftJoinAndSelect('identity.upi', 'upi')
      .leftJoinAndSelect('member.payin', 'payin')
      .where('member.isOnline = :isOnline', { isOnline: true })
      .andWhere('member.quota >= :amount', { amount })
      .andWhere(`${channelName}.id IS NOT NULL`)
      .getMany();
    if (!eligibleMembers || !eligibleMembers.length) return null;

    const memberWithLeastPayinCount = eligibleMembers.reduce((prev, curr) => {
      if (!prev) return curr;
      return prev.payin.length <= curr.payin.length ? prev : curr;
    }, null);

    return memberWithLeastPayinCount;
  }

  async getGatewayForPayin(
    channelName: string,
    amount,
    priority: GatewayName | null = null,
  ) {
    let selectedGateway;
    // let selectedGateway =
    //   priority ||
    //   (await this.systemConfigService.findLatest()).defaultPayinGateway;

    // const alternateGateway =
    //   selectedGateway === GatewayName.RAZORPAY
    //     ? GatewayName.PHONEPE
    //     : GatewayName.RAZORPAY;

    // const isSelectedGatewayEnabled = await this.checkGatewayAndChannelEnabled(
    //   selectedGateway,
    //   channelName,
    // );

    // if (!isSelectedGatewayEnabled) {
    //   selectedGateway = alternateGateway;
    //   const isSelectedGatewayEnabled = await this.checkGatewayAndChannelEnabled(
    //     selectedGateway,
    //     channelName,
    //   );

    if (true) {
      while (true) {
        const selectedMember = await this.getMemberForPayin(
          channelName,
          amount,
        );
        if (selectedMember) return selectedMember;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return selectedGateway;
  }

  checkGatewayAndChannelEnabled = async (
    gatewayName: GatewayName,
    channelName: string,
  ) => {
    const gateway = await (
      gatewayName === GatewayName.RAZORPAY
        ? this.razorpayRepository
        : this.phonePeRepository
    ).findOne({
      where: { incoming: true },
    });

    const channelMap = {
      upi: ChannelName.UPI,
      netBanking: ChannelName.BANKING,
      eWallet: ChannelName.E_WALLET,
    };

    const channelEnabled = await this.channelSettingsRepository.findOne({
      where: {
        gatewayName,
        enabled: true,
        channelName: channelMap[channelName],
      },
    });

    return gateway && channelEnabled;
  };
}
