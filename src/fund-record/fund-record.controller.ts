import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FundRecordService } from './fund-record.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import {
  CreateSettlementDto,
  MemberSettlementDto,
} from './dto/create-fund-record.dto';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Role } from 'src/utils/enum/enum';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';

@Controller('fund-record')
@UseGuards(RolesGuard)
export class FundRecordController {
  constructor(private readonly fundRecordService: FundRecordService) {}

  @Post('/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  async paginateFundRecords(
    @Body() paginateRequestBody: PaginateRequestDto,
    @UserInReq() user,
  ) {
    let email = user?.email;
    if (!user.type?.includes('admin')) email = null;

    return await this.fundRecordService.paginateFundRecords(
      paginateRequestBody,
      email,
    );
  }

  @Post('/admin-adjustment')
  async adminAdjustment(@Body() requestBody: CreateSettlementDto) {
    return await this.fundRecordService.adminAdjustment(requestBody);
  }

  @Post('/member-adjustment')
  async memberAdjustment(@Body() requestBody: MemberSettlementDto) {
    return await this.fundRecordService.memberAdjustment(requestBody);
  }
}
