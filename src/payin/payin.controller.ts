import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
export class PayinController {
  constructor(
    private payinAdminService: PayinAdminService,
    private payinMemberService: PayinMemberService,
    private payinMerchantService: PayinMerchantService,
    private payinService: PayinService,
  ) {}

  @Post()
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  create(@Body() createPayinDto) {
    return this.payinService.create(createPayinDto);
  }

  @Post('admin/paginate')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  adminPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payinAdminService.paginatePayins(paginateRequestDto);
  }

  @Post('merchant/paginate')
  @Roles(Role.MERCHANT, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
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
  @UseGuards(RolesGuard)
  memberPayins(
    @UserInReq() user,
    @Body() paginateRequestDto: PaginateRequestDto,
  ) {
    return this.payinMemberService.paginatePayins(paginateRequestDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  getAllPayins() {
    return this.payinService.findAll();
  }

  @Get('admin/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  getPayinOrderDetailsAdmin(@Param('id') id: string) {
    return this.payinAdminService.getPayinDetails(id);
  }

  @Get('merchant/:id')
  @Roles(Role.MERCHANT)
  @UseGuards(RolesGuard)
  getPayinOrderDetailsMerchant(@Param('id') id: string) {
    return this.payinMerchantService.getPayinDetails(id);
  }

  @Get('member/:id')
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  getPayinOrderDetailsMember(@Param('id') id: string) {
    return this.payinMemberService.getPayinDetails(id);
  }

  @Post('update-status-assigned')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  updatePayinStatusToAssigned(@Body() body) {
    return this.payinService.updatePayinStatusToAssigned(body);
  }

  @Post('update-status-complete')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  updatePayinStatusToCompleted(@Body() body) {
    return this.payinService.updatePayinStatusToComplete(body);
  }

  @Post('update-status-failed')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  updatePayinStatusToFailed(@Body() body) {
    return this.payinService.updatePayinStatusToFailed(body);
  }

  @Post('update-status-submitted')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  updatePayinStatusToSubmitted(@Body() body) {
    return this.payinService.updatePayinStatusToSubmitted(body);
  }

  @Put('success-callback/:id')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  handleCallbackStatusSuccess(@Param('id') id: string) {
    return this.payinService.handleCallbackStatusSuccess(id);
  }
}
