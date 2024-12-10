import { Body, Controller, Post } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Post()
  async createOrganization(@Body() body: { agentId: number }) {
    return this.organizationService.createOrganization(body.agentId);
  }

  @Post('paginate')
  async paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.organizationService.paginate(paginateRequestDto);
  }
}
