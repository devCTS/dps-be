import { Module } from '@nestjs/common';
import { SubMerchantService } from './sub-merchant.service';
import { SubMerchantController } from './sub-merchant.controller';
import { IdentityModule } from '../identity/identity.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubMerchant } from './entities/sub-merchant.entity';
import { IntegrationsModule } from 'src/integrations/integrations.module';

@Module({
  imports: [TypeOrmModule.forFeature([SubMerchant]), IdentityModule],
  controllers: [SubMerchantController],
  providers: [SubMerchantService],
})
export class SubMerchantModule {}
