import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from './entities/identity.entity';
import { IP } from './entities/ip.entity';
import { JwtModule } from 'src/services/jwt/jwt.module';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Member } from 'src/member/entities/member.entity';
import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import { Agent } from 'src/agent/entities/agent.entity';
import { ChannelModule } from 'src/channel/channel.module';
import { GatewayModule } from 'src/gateway/gateway.module';
import { Withdrawal } from 'src/withdrawal/entities/withdrawal.entity';
import { Payout } from 'src/payout/entities/payout.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Identity,
      IP,
      Merchant,
      Admin,
      Member,
      Submerchant,
      Agent,
      Withdrawal,
      Payout,
    ]),
    JwtModule,
    ChannelModule,
    GatewayModule,
  ],
  controllers: [IdentityController],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
