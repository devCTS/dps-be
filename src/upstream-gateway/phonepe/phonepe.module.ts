import { Module } from '@nestjs/common';
import { PhonepeService } from './phonepe.service';
import { PhonepeController } from './phonepe.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PhonepeService],
  controllers: [PhonepeController],
})
export class PhonepeModule {}
