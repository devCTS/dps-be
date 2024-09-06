import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from './entities/merchant.entity';
import { MerchantRepository } from './merchant.repository';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { IdentityModule } from 'src/identity/identity.module';
import { MerchantToChannel } from './entities/merchantToChannel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Merchant, MerchantToChannel]),
    IdentityModule,
  ],
  providers: [MerchantRepository, MerchantService],
  controllers: [MerchantController],
})
export class MerchantModule {}
