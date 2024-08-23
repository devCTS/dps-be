import { Module } from '@nestjs/common';
import { MerchantRepository } from './merchant.repository';
import { Merchant } from './merchant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from 'src/identity/identity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Merchant]), MerchantRepository, Identity],
  providers: [MerchantRepository, Identity],
})
export class MerchantModule {}
