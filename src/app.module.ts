import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantModule } from './merchant/merchant.module';
import { IdentityModule } from './identity/identity.module';
import { MemberModule } from './member/member.module';
import { SubMerchantModule } from './sub-merchant/sub-merchant.module';
import { AdminModule } from './admin/admin.module';
import { ChannelModule } from './channel/channel.module';
import { GatewayModule } from './gateway/gateway.module';

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

    MerchantModule,
    IdentityModule,
    MemberModule,
    MemberModule,
    SubMerchantModule,
    AdminModule,
    ChannelModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
