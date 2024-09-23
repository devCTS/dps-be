import { Module } from '@nestjs/common';
import { SubMerchantService } from './sub-merchant.service';
import { SubMerchantController } from './sub-merchant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submerchant } from './entities/sub-merchant.entity';
import { IdentityModule } from 'src/identity/identity.module';
import { MerchantModule } from 'src/merchant/merchant.module';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { JwtModule } from 'src/services/jwt/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submerchant, Merchant]),
    IdentityModule,
    MerchantModule,
    JwtModule,
  ],
  controllers: [SubMerchantController],
  providers: [SubMerchantService],
  exports: [SubMerchantService],
})
export class SubMerchantModule {}
