import { Module } from '@nestjs/common';
import { BulletinController } from './bulletin.controller';
import { BulletinService } from './bulletin.service';
import { TopupModule } from 'src/topup/topup.module';
import { PayoutModule } from 'src/payout/payout.module';
import { PayinModule } from 'src/payin/payin.module';

@Module({
  imports: [TopupModule, PayoutModule, PayinModule],
  controllers: [BulletinController],
  providers: [BulletinService],
})
export class BulletinModule {}
