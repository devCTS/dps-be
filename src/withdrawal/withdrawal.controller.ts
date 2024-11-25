import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { WithdrawalMemberService } from './withdrawal-member.service';
import { WithdrawalMerchantService } from './withdrawal-merchant.service';
import { WithdrawalAgentService } from './withdrawal-agent.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { WithdrawalAdminService } from './withdrawal-admin.service';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';

@Controller('withdrawal')
export class WithdrawalController {
  constructor(
    private readonly withdrawalService: WithdrawalService,
    private readonly withdrawalMemberService: WithdrawalMemberService,
    private readonly withdrawalMerchantService: WithdrawalMerchantService,
    private readonly withdrawalAgentService: WithdrawalAgentService,
    private readonly withdrawalAdminService: WithdrawalAdminService,
  ) {}

  @Post()
  @Roles(Role.MERCHANT, Role.AGENT, Role.MEMBER)
  @UseGuards(RolesGuard)
  create(@Body() createWithdrawalDto: CreateWithdrawalDto) {
    return this.withdrawalService.create(createWithdrawalDto);
  }

  @Post('admin/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  adminPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.withdrawalAdminService.paginateWithdrawals(paginateRequestDto);
  }

  @Get('admin/:id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  getOrderDetailsForAdmin(@Param('id') id: string) {
    return this.withdrawalAdminService.getOrderDetails(id);
  }

  @Post('member/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  memberPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.withdrawalMemberService.paginateWithdrawals(paginateRequestDto);
  }

  @Get('member/:id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  getOrderDetailsForMember(@Param('id') id: string) {
    return this.withdrawalMemberService.getOrderDetails(id);
  }

  @Post('merchant/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  merchantPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.withdrawalMerchantService.paginateWithdrawals(
      paginateRequestDto,
    );
  }

  @Get('merchant/:id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  getOrderDetailsForMerchant(@Param('id') id: string) {
    return this.withdrawalMerchantService.getOrderDetails(id);
  }

  @Post('agent/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.AGENT)
  @UseGuards(RolesGuard)
  agentPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.withdrawalAgentService.paginateWithdrawals(paginateRequestDto);
  }

  @Get('agent/:id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.AGENT)
  @UseGuards(RolesGuard)
  getOrderDetailsForAgent(@Param('id') id: string) {
    return this.withdrawalAgentService.getOrderDetails(id);
  }

  @Get('member-channel-details/:id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.MEMBER)
  @UseGuards(RolesGuard)
  getChannelProfileDetailsForMember(@Param('id') id: string) {
    return this.withdrawalMemberService.getChannelProfileDetails(+id);
  }

  @Get('merchant-channel-details/:id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.MERCHANT)
  @UseGuards(RolesGuard)
  getChannelProfileDetailsForMerchant(@Param('id') id: string) {
    return this.withdrawalMerchantService.getChannelProfileDetails(+id);
  }

  @Get('agent-channel-details/:id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN, Role.AGENT)
  @UseGuards(RolesGuard)
  getChannelProfileDetailsForAgent(@Param('id') id: string) {
    return this.withdrawalAgentService.getChannelProfileDetails(+id);
  }

  @Post('update-status-complete')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  updateStatusToComplete(@Body() body) {
    return this.withdrawalService.updateStatusToComplete(body);
  }

  @Post('update-status-rejected')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  updateStatusToRejected(@Body() body) {
    return this.withdrawalService.updateStatusToRejected(body);
  }

  @Post('update-status-failed')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  updateStatusToFailed(@Body() body) {
    return this.withdrawalService.updateStatusToFailed(body);
  }

  @Post('make-gateway-payout')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  makeGatewayPayout(@Body() body) {
    return this.withdrawalService.makeGatewayPayout(body);
  }

  @Put('success-notification/:id')
  @Roles(Role.ALL)
  @UseGuards(RolesGuard)
  handleNotificationStatusSuccess(@Param('id') id: string) {
    return this.withdrawalService.handleNotificationStatusSuccess(id);
  }
}
