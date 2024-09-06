import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { AdminRepository } from './admin.repository';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { IdentityModule } from 'src/identity/identity.module';

@Module({
  imports: [TypeOrmModule.forFeature([Admin]), IdentityModule],
  providers: [AdminRepository, AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
