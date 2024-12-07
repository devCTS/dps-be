import { Module } from '@nestjs/common';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from './entities/merchant.entity';
import { IdentityModule } from '../identity/identity.module';
import { IntegrationsModule } from 'src/integrations/integrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Merchant]),
    IdentityModule,
    IntegrationsModule,
  ],
  controllers: [MerchantController],
  providers: [MerchantService],
})
export class MerchantModule {}
