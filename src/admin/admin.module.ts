import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Identity } from 'src/identity/entities/identity.entity';
import { IdentityModule } from 'src/identity/identity.module';
import { JwtModule } from 'src/services/jwt/jwt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Identity]),
    IdentityModule,
    JwtModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
