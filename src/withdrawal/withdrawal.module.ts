import { Module } from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { WithdrawalController } from './withdrawal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Member } from 'src/member/entities/member.entity';
import { WithdrawalMemberService } from './withdrawal-member.service';
import { Agent } from 'http';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { WithdrawalAgentService } from './withdrawal-agent.service';
import { WithdrawalAdminService } from './withdrawal-admin.service';
import { WithdrawalMerchantService } from './withdrawal-merchant.service';
import { Identity } from 'src/identity/entities/identity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Withdrawal, Member, Agent, Merchant, Identity]),
  ],
  controllers: [WithdrawalController],
  providers: [
    WithdrawalService,
    WithdrawalMemberService,
    WithdrawalAgentService,
    WithdrawalAdminService,
    WithdrawalMerchantService,
  ],
})
export class WithdrawalModule {}
