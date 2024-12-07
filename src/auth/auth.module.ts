import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from 'src/users/identity/entities/identity.entity';
import { IntegrationsModule } from 'src/integrations/integrations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Identity]), IntegrationsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
