import { forwardRef, Module } from '@nestjs/common';
import { MerchantRepository } from './merchant.repository';
import { Merchant } from './merchant.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { IdentityModule } from 'src/identity/identity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Merchant]),
    MerchantRepository,
    forwardRef(() => IdentityModule),
  ],
  providers: [MerchantRepository, MerchantService],
  controllers: [MerchantController],
})
export class MerchantModule {}
