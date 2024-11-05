import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { UpdateTransactionUpdateDto } from './dto/update-transaction-update.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { Identity } from 'src/identity/entities/identity.entity';
import { MemberReferralService } from 'src/member-referral/member-referral.service';
import { SystemConfigService } from 'src/system-config/system-config.service';

@Injectable()
export class TransactionUpdatesTopupService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    private readonly memberReferralService: MemberReferralService,
    private readonly systemConfigService: SystemConfigService,
  ) {}

  async processReferral(
    referral,
    orderType,
    orderAmount,
    orderDetails,
    systemOrderId,
  ) {
    let userType = UserTypeForTransactionUpdates.MERCHANT_BALANCE;
    let before = 0,
      rate = 0, // service rate / commission rates
      amount = 0, // total service fee / commissions
      after = 0;

    // Member Quota - member selected for payment
    if (!referral.children || referral.children.length <= 0) {
      userType = UserTypeForTransactionUpdates.MEMBER_QUOTA;
      rate = referral.topupCommission;
      amount = (orderAmount / 100) * rate;
      before = referral.quota;
      after = before + orderAmount + amount;
    } else {
      // agent members
      userType = UserTypeForTransactionUpdates.MEMBER_BALANCE;
      rate = referral.topupCommission;
      amount = (orderAmount / 100) * rate;
      before = referral.balance;
      after = before + amount;
    }

    const identity = await this.identityRepository.findOne({
      where: { email: referral.email },
      relations: ['member', 'agent'],
    });

    const transactionUpdate = {
      orderType,
      userType,
      rate,
      amount,
      before,
      after,
      name: `${referral.firstName} ${referral.lastName}`,
      isAgentOf:
        referral.children?.length > 0
          ? `${referral.children[0]?.firstName} ${referral.children[0]?.lastName}`
          : null,
      topupOrder: orderDetails,
      systemOrderId,
      user: identity,
    };

    await this.transactionUpdateRepository.save(transactionUpdate);

    if (referral.children && referral.children.length > 0)
      await this.processReferral(
        referral.children[0],
        orderType,
        orderAmount,
        orderDetails,
        systemOrderId,
      );
  }

  async create({ orderDetails, orderType, systemOrderId, userId = null }) {
    const { amount } = orderDetails;

    const referrals =
      await this.memberReferralService.getReferralTreeOfUser(userId);

    await this.processReferral(
      referrals,
      orderType,
      amount,
      orderDetails,
      systemOrderId,
    );

    return HttpStatus.CREATED;
  }

  findAll() {
    return `This action returns all transactionUpdates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transactionUpdate`;
  }

  update(id: number, updateTransactionUpdateDto: UpdateTransactionUpdateDto) {
    return `This action updates a #${id} transactionUpdate`;
  }

  remove(id: number) {
    return `This action removes a #${id} transactionUpdate`;
  }
}
