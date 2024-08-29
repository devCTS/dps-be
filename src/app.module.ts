import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { RazorpayModule } from 'nestjs-razorpay';
import { PaymentSystemModule } from './upstream-gateway/payment-system/payment-system.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantModule } from './merchant/merchant.module';
import { MemberModule } from './member/member.module';
import { IdentityModule } from './identity/identity.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { ChannelsModule } from './channels/channels.module';
import { GatewaysModule } from './gateways/gateways.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.development.env',
          isGlobal: true,
        }),
      ],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('PG_HOST'),
        port: +configService.get('PG_PORT'),
        username: configService.get('PG_USERNAME'),
        password: configService.get('PG_PASSWORD'),
        database: configService.get('PG_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    RazorpayModule.forRoot({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
    }),
    UserModule,
    PaymentSystemModule,
    MerchantModule,
    MemberModule,
    IdentityModule,
    AuthModule,
    ChannelsModule,
    GatewaysModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    AuthService,
  ],
})
export class AppModule {}
