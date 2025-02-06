import { Module } from '@nestjs/common';
import { UniqpayService } from './uniqpay.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from 'src/services/jwt/jwt.module';
import { HttpModule } from '@nestjs/axios';
import { Uniqpay } from 'src/gateway/entities/uniqpay.entity';
import { EndUser } from 'src/end-user/entities/end-user.entity';
import { Identity } from 'src/identity/entities/identity.entity';
import { IdentityModule } from 'src/identity/identity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Uniqpay, EndUser, Identity]),
    HttpModule,
    JwtModule,
    IdentityModule,
  ],
  providers: [UniqpayService],
  exports: [UniqpayService],
})
export class UniqpayModule {}
