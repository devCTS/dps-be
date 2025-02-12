import { Module } from '@nestjs/common';
import { PayuService } from './payu.service';
import { HttpModule } from '@nestjs/axios';
import { Payu } from 'src/gateway/entities/payu.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from 'src/services/jwt/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payu]), HttpModule, JwtModule],
  providers: [PayuService],
  exports: [PayuService],
})
export class PayuModule {}
