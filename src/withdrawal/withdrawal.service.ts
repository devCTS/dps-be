import { TransactionUpdatesWithdrawalService } from './../transaction-updates/transaction-updates-withdrawal.service';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Repository } from 'typeorm';
import * as uniqid from 'uniqid';
import {
  OrderType,
  UserTypeForTransactionUpdates,
  WithdrawalMadeOn,
  WithdrawalOrderStatus,
} from 'src/utils/enum/enum';
import { Identity } from 'src/identity/entities/identity.entity';
import { IdentityService } from 'src/identity/identity.service';
import { MemberService } from 'src/member/member.service';
import { MerchantService } from 'src/merchant/merchant.service';
import { AgentService } from 'src/agent/agent.service';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { SystemConfigService } from 'src/system-config/system-config.service';
import { PaymentSystemService } from 'src/payment-system/payment-system.service';

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepository: Repository<TransactionUpdate>,

    private readonly identityService: IdentityService,
    private readonly transactionUpdatesWithdrawalService: TransactionUpdatesWithdrawalService,
    private readonly memberService: MemberService,
    private readonly merchantService: MerchantService,
    private readonly agentService: AgentService,
    private readonly systemConfigService: SystemConfigService,
    private readonly paymentSystemService: PaymentSystemService,
  ) {}

  async create(createWithdrawalDto: CreateWithdrawalDto) {
    const { channel, channelDetails, withdrawalAmount, email } =
      createWithdrawalDto;

    const user = await this.identityRepository.findOneBy({
      email,
    });
    if (!user) throw new NotFoundException('User not found!');

    const createWithdrawalOrder = await this.withdrawalRepository.save({
      channel,
      channelDetails,
      amount: withdrawalAmount,
      systemOrderId: uniqid(),
      user,
    });
    if (!createWithdrawalOrder)
      throw new InternalServerErrorException('Failed to create order!');

    return HttpStatus.CREATED;
  }

  async makeGatewayPayout(body) {
    const res = await this.paymentSystemService.makeGatewayPayout(body);

    console.log(res);

    // if (res.status === 'success')
    //   await this.updateStatusToComplete({
    //     id: body.orderId,
    //     transactionDetails: res.transactionDetails,
    //     withdrawalMadeOn: WithdrawalMadeOn.GATEWAY,
    //   });
  }

  async updateStatusToComplete(body) {
    const { id, transactionDetails, withdrawalMadeOn } = body;

    const orderDetails = await this.withdrawalRepository.findOne({
      where: {
        systemOrderId: id,
      },
      relations: ['user'],
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

    const user = await this.identityService.getUser(
      orderDetails.user.id,
      orderDetails.user.userType,
    );

    await this.transactionUpdatesWithdrawalService.create({
      orderDetails,
      orderType: OrderType.WITHDRAWAL,
      systemOrderId: orderDetails.systemOrderId,
      userRole: orderDetails.user.userType,
      withdrawalMadeOn: WithdrawalMadeOn.ADMIN,
      user,
    });

    await this.withdrawalRepository.update(orderDetails.id, {
      status: WithdrawalOrderStatus.COMPLETE,
      transactionDetails: JSON.stringify(transactionDetails),
      withdrawalMadeOn,
    });

    const transactionUpdateEntries =
      await this.transactionUpdateRepository.find({
        where: {
          systemOrderId: id,
        },
        relations: ['user'],
      });

    transactionUpdateEntries.forEach(async (entry) => {
      if (entry.userType === UserTypeForTransactionUpdates.MERCHANT_BALANCE)
        await this.merchantService.updateBalance(
          entry.user.id,
          -orderDetails.amount,
          false,
        );

      if (entry.userType === UserTypeForTransactionUpdates.MEMBER_BALANCE)
        await this.memberService.updateBalance(
          entry.user.id,
          -orderDetails.amount,
          false,
        );

      if (entry.userType === UserTypeForTransactionUpdates.AGENT_BALANCE)
        await this.agentService.updateBalance(
          entry.user.id,
          -orderDetails.amount,
          false,
        );

      if (entry.userType === UserTypeForTransactionUpdates.SYSTEM_PROFIT)
        await this.systemConfigService.updateSystemProfit(
          entry.amount,
          entry.systemOrderId,
          false,
        );
    });

    return HttpStatus.OK;
  }

  async updateStatusToRejected(body) {
    const { id } = body;

    const orderDetails = await this.withdrawalRepository.findOneBy({
      systemOrderId: id,
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

    await this.withdrawalRepository.update(orderDetails.id, {
      status: WithdrawalOrderStatus.REJECTED,
    });

    return HttpStatus.OK;
  }

  async updateStatusToFailed(body) {
    const { id } = body;

    const orderDetails = await this.withdrawalRepository.findOneBy({
      systemOrderId: id,
    });
    if (!orderDetails) throw new NotFoundException('Order not found!');

    await this.withdrawalRepository.update(orderDetails.id, {
      status: WithdrawalOrderStatus.FAILED,
    });

    return HttpStatus.OK;
  }
}
