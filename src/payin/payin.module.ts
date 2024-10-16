import { Module } from '@nestjs/common';
import { PayinController } from './payin.controller';
import { Payin } from './entities/payin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayinAdminService } from './payin-admin.service';
import { PayinMemberService } from './payin-member.service';
import { PayinMerchantService } from './payin-merchant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payin])],
  controllers: [PayinController],
  providers: [PayinAdminService, PayinMemberService, PayinMerchantService],
  exports: [PayinAdminService, PayinMemberService, PayinMerchantService],
})
export class PayinModule {}
