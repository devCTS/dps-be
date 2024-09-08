import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Identity } from 'src/identity/entities/identity.entity';
import { IdentityModule } from 'src/identity/identity.module';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Identity]), IdentityModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
