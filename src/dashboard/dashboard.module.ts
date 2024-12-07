import { Module } from '@nestjs/common';
import { PaginateModule } from './paginate/paginate.module';

@Module({
  imports: [PaginateModule],
})
export class DashboardModule {}
