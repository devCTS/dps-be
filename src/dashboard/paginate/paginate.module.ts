import { Module } from '@nestjs/common';
import { PaginateService } from './paginate.service';
import { PaginateController } from './paginate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/users/admin/entities/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin])],
  controllers: [PaginateController],
  providers: [PaginateService],
})
export class PaginateModule {}
