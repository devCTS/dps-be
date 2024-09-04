import { forwardRef, Module } from '@nestjs/common';
import { IdentityRepository } from './identity.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from './identity.entity';
import { IdentityService } from './identity.service';
import { MerchantModule } from 'src/merchant/merchant.module';

@Module({
  imports: [TypeOrmModule.forFeature([Identity])],
  providers: [IdentityRepository, IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
