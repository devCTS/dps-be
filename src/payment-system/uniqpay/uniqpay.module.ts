import { Module } from '@nestjs/common';
import { UniqpayService } from './uniqpay.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from 'src/services/jwt/jwt.module';
import { HttpModule } from '@nestjs/axios';
import { Uniqpay } from 'src/gateway/entities/uniqpay.entity';
import { EndUser } from 'src/end-user/entities/end-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Uniqpay, EndUser]),
    HttpModule,
    JwtModule,
  ],
  providers: [UniqpayService],
  exports: [UniqpayService],
})
export class UniqpayModule {}
