import { EndUserService } from 'src/end-user/end-user.service';
import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

@Controller('end-user')
@UseGuards(RolesGuard)
export class EndUserController {
  constructor(private readonly endUserService: EndUserService) {}

  @Post('paginate')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  paginate(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.endUserService.paginate(paginateRequestDto);
  }

  @Put('toggle-blacklisted/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  toggleBlacklisted(@Param('id') id: number) {
    return this.endUserService.toggleBlacklisted(+id);
  }
}
