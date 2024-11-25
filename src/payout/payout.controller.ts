import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';
import { PayoutAdminService } from './payout-admin.service';
import { PayoutMemberService } from './payout-member.service';
import { PayoutMerchantService } from './payout-merchant.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';

@Controller('payout')
export class PayoutController {
  constructor(
    private readonly payoutService: PayoutService,
    private readonly payoutAdminService: PayoutAdminService,
    private readonly payoutMemberService: PayoutMemberService,
    private readonly payoutMerchantService: PayoutMerchantService,
  ) {}

  @Post()
  @Roles(Role.MERCHANT)
  @UseGuards(RolesGuard)
  create(@Body() createPayoutDto: CreatePayoutDto) {
    return this.payoutService.create(createPayoutDto);
  }

  @Get()
  @Roles(Role.SUB_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  findAll() {
    return this.payoutService.findAll();
  }

  @Get(':id')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.payoutService.findOne(id);
  }

  @Post('admin/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  adminPayouts(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payoutAdminService.paginate(paginateRequestDto);
  }

  @Post('merchant/paginate')
  @Roles(Role.MERCHANT, Role.SUPER_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  merchantPayouts(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payoutMerchantService.paginate(paginateRequestDto);
  }

  @Post('merchant-user/paginate')
  @Roles(Role.MERCHANT)
  @UseGuards(RolesGuard)
  merchantUserPayouts(
    @Body() paginateRequestDto: PaginateRequestDto,
    @Query('searchSuggestion') searchSuggestion: any,
  ) {
    return this.payoutMerchantService.paginateMerchantUsers(
      paginateRequestDto,
      searchSuggestion,
    );
  }

  @Post('member/paginate')
  @Roles(Role.MEMBER, Role.SUPER_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  memberPayouts(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.payoutMemberService.paginate(paginateRequestDto);
  }

  @Get('admin/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  getPayoutOrderDetailsAdmin(@Param('id') id: string) {
    return this.payoutAdminService.getPayoutDetails(id);
  }

  @Get('merchant/:id')
  @Roles(Role.MERCHANT)
  @UseGuards(RolesGuard)
  getPayoutOrderDetailsMerchant(@Param('id') id: string) {
    return this.payoutMerchantService.getPayoutDetails(id);
  }

  @Get('member/:id')
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  getPayoutOrderDetailsMember(@Param('id') id: string) {
    return this.payoutMemberService.getPayoutDetails(id);
  }

  @Post('update-status-assigned')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  updatePayoutStatusToAssigned(@Body() body) {
    return this.payoutService.updatePayoutStatusToAssigned(body);
  }

  @Post('update-status-complete')
  @Roles(Role.SUPER_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  updatePayoutStatusToCompleted(@Body() body) {
    return this.payoutService.updatePayoutStatusToComplete(body);
  }

  @Post('update-status-failed')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  updatePayoutStatusToFailed(@Body() body) {
    return this.payoutService.updatePayoutStatusToFailed(body);
  }

  @Post('update-status-submitted')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  updatePayoutStatusToSubmitted(@Body() body) {
    return this.payoutService.updatePayoutStatusToSubmitted(body);
  }

  @Put('success-notification/:id')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  handleNotificationStatusSuccess(@Param('id') id: string) {
    return this.payoutService.handleNotificationStatusSuccess(id);
  }
}
