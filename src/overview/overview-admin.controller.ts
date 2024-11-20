import { Controller } from '@nestjs/common';
import { OverviewAdminService } from './overview-admin.service';

@Controller('overview-admin')
export class OverviewController {
  constructor(private readonly overviewService: OverviewAdminService) {}
}
