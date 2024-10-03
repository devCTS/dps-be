import { Module } from '@nestjs/common';
import { PhonepeService } from './phonepe.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PhonepeService],
  exports: [PhonepeService],
})
export class PhonePeModule {}
