import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubMerchant } from './entities/sub-merchant.entity';
import { SubMerchantRepository } from './sub-merchant.repository';
import { SubMerchantController } from './sub-merchant.controller';
import { SubMerchantService } from './sub-merchant.service';
import { IdentityModule } from 'src/identity/identity.module';

@Module({
  imports: [TypeOrmModule.forFeature([SubMerchant]), IdentityModule],
  providers: [SubMerchantRepository, SubMerchantService],
  controllers: [SubMerchantController],
})
export class SubMerchantModule {}
