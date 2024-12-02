import { forwardRef, Module } from '@nestjs/common';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { Member } from 'src/member/entities/member.entity';
import { Agent } from 'http';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Alert } from './entities/alert.entity';
import { SocketModule } from 'src/socket/socket.module';
import { WithdrawalModule } from 'src/withdrawal/withdrawal.module';
import { PayoutModule } from 'src/payout/payout.module';
import { EndUser } from 'src/end-user/entities/end-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Member, Agent, Merchant, Alert, EndUser]),
    SocketModule,
    forwardRef(() => WithdrawalModule),
    forwardRef(() => PayoutModule),
  ],
  controllers: [AlertController],
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertModule {}
