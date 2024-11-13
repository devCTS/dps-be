import { Module } from '@nestjs/common';
import { AlertController } from './alert.controller';
import { AlertService } from './alert.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { Member } from 'src/member/entities/member.entity';
import { Agent } from 'http';
import { Merchant } from 'src/merchant/entities/merchant.entity';
import { Alert } from './entities/alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Member, Agent, Merchant, Alert])],
  controllers: [AlertController],
  providers: [AlertService],
})
export class AlertModule {}
