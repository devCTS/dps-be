import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { PayinAdminService } from './payin-admin.service';
import { PayinMerchantService } from './payin-merchant.service';
import { PayinMemberService } from './payin-member.service';
import { PayinService } from './payin.service';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Role } from 'src/utils/enum/enum';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';

@Controller('payin')
@UseGuards(RolesGuard)
export class PayinController {
  constructor(
    private payinAdminService: PayinAdminService,
    private payinMemberService: PayinMemberService,
    private payinMerchantService: PayinMerchantService,
    private payinService: PayinService,
  ) {}

  @Post()
  @Roles(Role.ALL)
  create(@Body() createPayinDto) {
    return this.payinService.create(createPayinDto);
  }

  @Post('admin/paginate')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  adminPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payinAdminService.paginatePayins(paginateRequestDto);
  }

  @Post('merchant/paginate')
  @Roles(Role.MERCHANT, Role.SUB_MERCHANT)
  merchantPayins(
    @UserInReq() user,
    @Body() paginateRequestDto: PaginateRequestDto,
  ) {
    return this.payinMerchantService.paginatePayins(
      user.id,
      paginateRequestDto,
    );
  }

  @Post('member/paginate')
  @Roles(Role.MEMBER)
  memberPayins(
    @UserInReq() user,
    @Body() paginateRequestDto: PaginateRequestDto,
  ) {
    return this.payinMemberService.paginatePayins(user.id, paginateRequestDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  getAllPayins() {
    return this.payinService.findAll();
  }

  @Get('admin/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  getPayinOrderDetailsAdmin(@Param('id') id: string) {
    return this.payinAdminService.getPayinDetails(id);
  }

  @Get('merchant/:id')
  @Roles(Role.MERCHANT)
  getPayinOrderDetailsMerchant(@Param('id') id: string) {
    return this.payinMerchantService.getPayinDetails(id);
  }

  @Get('member/:id')
  @Roles(Role.MEMBER)
  getPayinOrderDetailsMember(@Param('id') id: string) {
    return this.payinMemberService.getPayinDetails(id);
  }

  @Post('update-status-assigned')
  @Roles(Role.ALL)
  updatePayinStatusToAssigned(@Body() body) {
    return this.payinService.updatePayinStatusToAssigned(body);
  }

  @Post('update-status-complete')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  updatePayinStatusToCompleted(@Body() body) {
    return this.payinService.updatePayinStatusToComplete(body);
  }

  @Post('update-status-failed')
  @Roles(Role.ALL)
  updatePayinStatusToFailed(@Body() body) {
    return this.payinService.updatePayinStatusToFailed(body);
  }

  @Post('update-status-submitted')
  @Roles(Role.ALL)
  updatePayinStatusToSubmitted(@Body() body) {
    return this.payinService.updatePayinStatusToSubmitted(body);
  }

  @Put('success-callback/:id')
  @Roles(Role.ALL)
  handleCallbackStatusSuccess(@Param('id') id: string) {
    return this.payinService.handleCallbackStatusSuccess(id);
  }
}
