import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { Identity } from 'src/identity/entities/identity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetBanking } from './entity/net-banking.entity';
import { Config } from './entity/config.entity';
import { EWallet } from './entity/e-wallet.entity';
import { Upi } from './entity/upi.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NetBanking, Config, EWallet, Upi]),
    Identity,
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
