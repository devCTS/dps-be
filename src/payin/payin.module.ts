import { Module } from '@nestjs/common';
import { PayinController } from './payin.controller';
import { Payin } from './entities/payin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayinAdminService } from './payin-admin.service';
import { PayinMemberService } from './payin-member.service';
import { PayinMerchantService } from './payin-merchant.service';
import { TransactionUpdatesModule } from 'src/transaction-updates/transaction-updates.module';
import { PayinService } from './payin.service';
import { EndUserModule } from 'src/end-user/end-user.module';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { IdentityModule } from 'src/identity/identity.module';
import { Identity } from 'src/identity/entities/identity.entity';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { MerchantModule } from 'src/merchant/merchant.module';
import { SystemConfigModule } from 'src/system-config/system-config.module';
import { TransactionUpdate } from 'src/transaction-updates/entities/transaction-update.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payin,
      EndUser,
      Identity,
      Merchant,
      TransactionUpdate,
    ]),
    TransactionUpdatesModule,
    EndUserModule,
    IdentityModule,
    MerchantModule,
    SystemConfigModule,
    TransactionUpdatesModule,
  ],
  controllers: [PayinController],
  providers: [
    PayinAdminService,
    PayinMemberService,
    PayinMerchantService,
    PayinService,
  ],
  exports: [PayinAdminService, PayinMemberService, PayinMerchantService],
})
export class PayinModule {}
