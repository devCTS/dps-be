import { CreateSettlementDto } from './dto/create-settlement.dto';
import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgentService } from 'src/agent/agent.service';
import { Agent } from 'src/agent/entities/agent.entity';
import { Identity } from 'src/identity/entities/identity.entity';
import { Member } from 'src/member/entities/member.entity';
import { MemberService } from 'src/member/member.service';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { MerchantService } from 'src/merchant/merchant.service';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';
import { UserTypeForTransactionUpdates } from 'src/utils/enum/enum';
import { Repository } from 'typeorm';

@Injectable()
export class ManualSettlementService {
  constructor(
    @InjectRepository(TransactionUpdate)
    private readonly transactionUpdateRepositoy: Repository<TransactionUpdate>,
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

    const transactionUpdateEntry = {
      user,
      userType: UserTypeForTransactionUpdates.ADMIN_SETTLEMENT,
      before,
      after,
      amount,
      pending: false,
    };

    await this.transactionUpdateRepositoy.save(transactionUpdateEntry);
  }

  async memberQuotaSettlement({ identityId }) {
    const quota = 0;

    await this.memberService.updateQuota(identityId, '0', quota, false);

    const transactionUpdateEntry = {};

    await this.transactionUpdateRepositoy.save(transactionUpdateEntry);
  }
}
