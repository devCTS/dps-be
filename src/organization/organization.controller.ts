import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Get(':id')
  async getOrganizationTree(@Param('id') id: string) {
    return this.organizationService.getOrganizationTree(id);
  }
}
