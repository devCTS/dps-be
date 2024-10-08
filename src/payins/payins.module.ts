import { Module } from '@nestjs/common';
import { PayinsController } from './payins.controller';
import { PayinsService } from './payins.service';

@Module({
  controllers: [PayinsController],
  providers: [PayinsService]
})
export class PayinsModule {}
