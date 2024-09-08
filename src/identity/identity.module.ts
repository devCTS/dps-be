import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from './entities/identity.entity';
import { IP } from './entities/ip.entity';
import { JwtModule } from 'src/services/jwt/jwt.module';

@Module({
  imports: [TypeOrmModule.forFeature([Identity, IP]), JwtModule],
  controllers: [IdentityController],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
