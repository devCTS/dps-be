import { Module } from '@nestjs/common';
import { PayinController } from './payin.controller';
import { PayinService } from './payin.service';

@Module({
  controllers: [PayinController],
  providers: [PayinService],
})
export class PayinModule {}
