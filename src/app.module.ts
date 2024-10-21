import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from './identity/identity.module';
import { AdminModule } from './admin/admin.module';
import { MerchantModule } from './merchant/merchant.module';
import { MemberModule } from './member/member.module';
import { LoadModule } from './load/load.module';
import { SubMerchantModule } from './sub-merchant/sub-merchant.module';
import { ServicesModule } from './services/services.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ExportModule } from './export/export.module';
import { SystemConfigModule } from './system-config/system-config.module';
import { RolesModule } from './roles/roles.module';

import { AgentModule } from './agent/agent.module';
import { AgentReferralModule } from './agent-referral/agent-referral.module';
import { MemberReferralModule } from './member-referral/member-referral.module';
import { ChannelModule } from './channel/channel.module';
import { GatewayModule } from './gateway/gateway.module';
import { PaymentSystemModule } from './payment-system/payment-system.module';
import { PayoutModule } from './payout/payout.module';
import { EndUserModule } from './end-user/end-user.module';
import { PayinModule } from './payin/payin.module';
import { TransactionUpdatesModule } from './transaction-updates/transaction-updates.module';
import { UploadModule } from './upload/upload.module';

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
        namingStrategy: new SnakeNamingStrategy(),
      }),
      inject: [ConfigService],
    }),
    IdentityModule,
    AdminModule,
    MerchantModule,
    MemberModule,
    LoadModule,
    SubMerchantModule,
    ServicesModule,
    ExportModule,
    SystemConfigModule,
    RolesModule,
    AgentModule,
    AgentReferralModule,
    MemberReferralModule,
    ChannelModule,
    GatewayModule,
    PaymentSystemModule,
    PayoutModule,
    EndUserModule,
    PayinModule,
    TransactionUpdatesModule,
    UploadModule,
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
