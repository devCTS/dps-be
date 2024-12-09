import { Body, Controller, Post } from '@nestjs/common';
import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}
  @Post()
  async createOrganization(@Body() body: { agentId: number }) {
    return this.organizationService.createOrganization(body.agentId);
  }
}
