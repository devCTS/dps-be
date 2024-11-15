import { Topup } from 'src/topup/entities/topup.entity';
import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSettlementDto } from './dto/create-fund-record.dto';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Identity } from 'src/identity/entities/identity.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Member } from 'src/member/entities/member.entity';
import { Agent } from 'src/agent/entities/agent.entity';
import { MemberService } from 'src/member/member.service';
import { MerchantService } from 'src/merchant/merchant.service';
import { AgentService } from 'src/agent/agent.service';
import { FundRecord } from './entities/fund-record.entity';
import { OrderType, UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { getDescription } from './find-record.utils';

@Injectable()
export class FundRecordService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepositoy: Repository<TransactionUpdate>,
    @InjectRepository(FundRecord)
    private readonly fundRecordRepositoy: Repository<FundRecord>,
    @InjectRepository(Identity)
    private readonly identityRepository: Repository<Identity>,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,

    private readonly memberService: MemberService,
    private readonly merchantService: MerchantService,
    private readonly agentService: AgentService,
  ) {}

  async addFundRecordForSuccessOrder({
    orderType,
    orderAmount,
    systemOrderId,
  }) {
    switch (orderType) {
      case 'PAYIN':
        await this.createFundRecordForPayin({ orderAmount, systemOrderId });
        break;

      case 'PAYOUT':
        await this.createFundRecordForPayout({ orderAmount, systemOrderId });
        break;

      case 'WITHDRAWAL':
        await this.createFundRecordForWithdrawal({
          orderAmount,
          systemOrderId,
        });
        break;

      case 'TOPUP':
        await this.createFundRecordForTopup({ orderAmount, systemOrderId });
        break;
    }
  }

  private async createFundRecordForPayin({ orderAmount, systemOrderId }) {
    const transactionUpdateEntries = await this.transactionUpdateRepositoy.find(
      {
        where: {
          systemOrderId: systemOrderId,
          orderType: OrderType.PAYIN,
          pending: false,
        },
      },
    );

    for (const row of transactionUpdateEntries) {
      const fundRecordEntry = {
        orderType: OrderType.PAYIN,
        name: row.name,
        balanceType: row.userType,
        systemOrderId: row.systemOrderId,
        before: row.before,
        after: row.after,
        amount: row.amount || 0,
        serviceFee: row.amount || 0,
        orderAmount,
        user: row.user,
        description: getDescription(),
      };

      await this.fundRecordRepositoy.save(fundRecordEntry);
    }
  }

  private async createFundRecordForPayout({ orderAmount, systemOrderId }) {
    const transactionUpdateEntries = await this.transactionUpdateRepositoy.find(
      {
        where: {
          systemOrderId: systemOrderId,
          orderType: OrderType.PAYOUT,
          pending: false,
        },
      },
    );

    for (const row of transactionUpdateEntries) {
      const fundRecordEntry = {
        orderType: OrderType.PAYOUT,
        name: row.name,
        balanceType: row.userType,
        systemOrderId: row.systemOrderId,
        before: row.before,
        after: row.after,
        amount: row.amount || 0,
        serviceFee: row.amount || 0,
        orderAmount,
        user: row.user,
        description: getDescription(),
      };

      await this.fundRecordRepositoy.save(fundRecordEntry);
    }
  }

  private async createFundRecordForWithdrawal({ orderAmount, systemOrderId }) {
    const transactionUpdateEntries = await this.transactionUpdateRepositoy.find(
      {
        where: {
          systemOrderId: systemOrderId,
          orderType: OrderType.WITHDRAWAL,
          pending: false,
        },
      },
    );

    for (const row of transactionUpdateEntries) {
      const fundRecordEntry = {
        orderType: OrderType.WITHDRAWAL,
        name: row.name,
        balanceType: row.userType,
        systemOrderId: row.systemOrderId,
        before: row.before,
        after: row.after,
        amount: row.amount || 0,
        serviceFee: row.amount || 0,
        orderAmount,
        user: row.user,
        description: getDescription(),
      };

      await this.fundRecordRepositoy.save(fundRecordEntry);
    }
  }

  private async createFundRecordForTopup({ orderAmount, systemOrderId }) {
    const transactionUpdateEntries = await this.transactionUpdateRepositoy.find(
      {
        where: {
          systemOrderId: systemOrderId,
          orderType: OrderType.TOPUP,
          pending: false,
        },
      },
    );

    for (const row of transactionUpdateEntries) {
      const fundRecordEntry = {
        orderType: OrderType.TOPUP,
        name: row.name,
        balanceType: row.userType,
        systemOrderId: row.systemOrderId,
        before: row.before,
        after: row.after,
        amount: row.amount || 0,
        serviceFee: row.amount || 0,
        orderAmount,
        user: row.user,
        description: getDescription(),
      };

      await this.fundRecordRepositoy.save(fundRecordEntry);
    }
  }

  async updateBalanceOrQuota(createSettlementDto: CreateSettlementDto) {
    const { amount, identityId, operation } = createSettlementDto;

    let amountAfterOperation = 0;
    if (operation === 'INCREMENT') amountAfterOperation = amount;
    if (operation === 'DECREMENT') amountAfterOperation = -amount;

    const user = await this.identityRepository.findOne({
      where: {
        id: identityId,
      },
    });
    if (!user) throw new NotFoundException('User not found!');

    let before, after;

    switch (user.userType) {
      case 'MERCHANT':
        await this.merchantService.updateBalance(
          user.id,
          '0',
          amountAfterOperation,
          false,
        );

        const merchant = await this.merchantRepository.findOneBy({
          id: user.merchant.id,
        });

        before = merchant.balance;
        after = before + amount;

        break;

      case 'MEMBER':
        await this.memberService.updateBalance(
          user.id,
          '0',
          amountAfterOperation,
          false,
        );

        const member = await this.memberRepository.findOneBy({
          id: user.member.id,
        });

        before = member.balance;
        after = before + amount;

        break;

      case 'AGENT':
        await this.agentService.updateBalance(
          user.id,
          '0',
          amountAfterOperation,
          false,
        );

        const agent = await this.agentRepository.findOneBy({
          id: user.merchant.id,
        });

        before = agent.balance;
        after = before + amount;

        break;

      default:
        throw new NotAcceptableException('Invalid user type!');
    }
  }
}
