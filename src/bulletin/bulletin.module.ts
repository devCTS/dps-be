import { Module } from '@nestjs/common';
import { BulletinController } from './bulletin.controller';
import { BulletinService } from './bulletin.service';
import { TopupModule } from 'src/topup/topup.module';
import { PayoutModule } from 'src/payout/payout.module';

@Module({
  imports: [TopupModule, PayoutModule],
  controllers: [BulletinController],
  providers: [BulletinService],
})
export class BulletinModule {}
