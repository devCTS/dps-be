import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { Identity } from 'src/identity/entities/identity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetBanking } from './entity/net-banking.entity';
import { Config } from './entity/config.entity';
import { EWallet } from './entity/e-wallet.entity';
import { Upi } from './entity/upi.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NetBanking, Config, EWallet, Upi, Merchant]),
    Identity,
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [
    TypeOrmModule.forFeature([Upi, NetBanking, EWallet]),
    ChannelService,
  ],
})
export class ChannelModule {}
