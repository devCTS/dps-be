import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserDetailsAdminService } from './user-details-admin.service';
import { UserDetailsAgentService } from './user-details-agent.service';
import { UserDetailsMemberService } from './user-details-member.service';
import { UserDetailsMerchantService } from './user-details-merchant.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';

@Controller('user-details')
export class UserDetailsController {
  constructor(
    private readonly userDetailsAdminService: UserDetailsAdminService,
    private readonly userDetailsAgentService: UserDetailsAgentService,
    private readonly userDetailsMemberService: UserDetailsMemberService,
    private readonly userDetailsMerchantService: UserDetailsMerchantService,
  ) {}

  // ADMIN
  @Get('admin/:userId')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  getAdminDetails(@Param('userId') userId: string) {
    return this.userDetailsAdminService.getAdminDetails(+userId);
  }

  // AGENT
  @Get('agent/:userId')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  getAgentDetails(@Param('userId') userId: string) {
    return this.userDetailsAgentService.getAgentDetails(+userId);
  }

  @Post('agent/withdrawals/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  paginateAgentWithdrawals(@Body() body: PaginateRequestDto) {
    return this.userDetailsAgentService.paginateAgentWithdrawals(body);
  }

  @Post('agent/commissions/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  paginateAgentCommissions(@Body() body: PaginateRequestDto) {
    return this.userDetailsAgentService.paginateAgentCommissions(body);
  }

  @Post('agent/fund-records/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  paginateAgentFundRecords(@Body() body: PaginateRequestDto) {
    return this.userDetailsAgentService.paginateAgentFundRecords(body);
  }

  // MEMBER
  @Get('member/:userId')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  getMemberDetails(@Param('userId') userId: string) {
    return this.userDetailsMemberService.getMemberDetails(+userId);
  }

  @Post('member/payins/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  paginateMemberPayins(@Body() body: PaginateRequestDto) {
    return this.userDetailsMemberService.paginateMemberPayins(body);
  }

  @Post('member/payouts/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  paginateMemberPayouts(@Body() body: PaginateRequestDto) {
    return this.userDetailsMemberService.paginateMemberPayouts(body);
  }

  @Post('member/withdrawals/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  paginateMemberWithdrawals(@Body() body: PaginateRequestDto) {
    return this.userDetailsMemberService.paginateMemberWithdrawals(body);
  }

  @Post('member/topups/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  paginateMemberTopups(@Body() body: PaginateRequestDto) {
    return this.userDetailsMemberService.paginateMemberTopups(body);
  }

  @Post('member/commissions/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  paginateMemberCommissions(@Body() body: PaginateRequestDto) {
    return this.userDetailsMemberService.paginateMemberCommissions(body);
  }

  @Post('member/fund-records/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  paginateMemberFundRecords(@Body() body: PaginateRequestDto) {
    return this.userDetailsMemberService.paginateMemberFundRecords(body);
  }

  // MERCHANT
  @Get('merchant/:userId')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  getMerchantDetails(@Param('userId') userId: string) {
    return this.userDetailsMerchantService.getMerchantDetails(+userId);
  }

  @Post('merchant/payins/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  paginateMerchantPayins(@Body() body: PaginateRequestDto) {
    return this.userDetailsMerchantService.paginateMerchantPayins(body);
  }

  @Post('merchant/payouts/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  paginateMerchantPayouts(@Body() body: PaginateRequestDto) {
    return this.userDetailsMerchantService.paginateMerchantPayouts(body);
  }

  @Post('merchant/withdrawals/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  paginateMerchantWithdrawals(@Body() body: PaginateRequestDto) {
    return this.userDetailsMerchantService.paginateMerchantWithdrawals(body);
  }

  @Post('merchant/fund-records/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  paginateMerchantFundRecords(@Body() body: PaginateRequestDto) {
    return this.userDetailsMerchantService.paginateMerchantFundRecords(body);
  }
}
