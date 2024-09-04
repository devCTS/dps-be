import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from './merchant.entity';
import { MerchantRepository } from './merchant.repository';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { IdentityModule } from 'src/identity/identity.module';

@Module({
  imports: [TypeOrmModule.forFeature([Merchant]), IdentityModule],
  providers: [MerchantRepository, MerchantService],
  controllers: [MerchantController],
})
export class MerchantModule {}
