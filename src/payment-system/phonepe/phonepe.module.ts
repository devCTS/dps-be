import { Module } from '@nestjs/common';
import { PhonepeService } from './phonepe.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Phonepe } from 'src/gateway/entities/phonepe.entity';
import { JwtModule } from 'src/services/jwt/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([Phonepe]), HttpModule, JwtModule],
  providers: [PhonepeService],
  exports: [PhonepeService],
})
export class PhonePeModule {}
