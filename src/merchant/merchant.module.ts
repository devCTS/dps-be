import { Module } from '@nestjs/common';
import { MerchantRepository } from './merchant.repository';
import { Merchant } from './merchant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from 'src/identity/identity.entity';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Merchant]), MerchantRepository, Identity],
  providers: [MerchantRepository, Identity, MerchantService],
  controllers: [MerchantController],
})
export class MerchantModule {}
