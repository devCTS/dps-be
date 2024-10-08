import { Module } from '@nestjs/common';
import { SubMerchantService } from './sub-merchant.service';
import { SubMerchantController } from './sub-merchant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submerchant } from './entities/sub-merchant.entity';
import { IdentityModule } from 'src/identity/identity.module';
import { MerchantModule } from 'src/merchant/merchant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submerchant]),
    IdentityModule,
    MerchantModule,
  ],
  controllers: [SubMerchantController],
  providers: [SubMerchantService],
})
export class SubMerchantModule {}
