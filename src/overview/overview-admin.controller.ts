import { Body, Controller, Get, Post } from '@nestjs/common';
import { OverviewAdminService } from './overview-admin.service';
import { FiltersDto } from './dtos/filters-dto';

@Controller('overview-admin')
export class OverviewAdminController {
  constructor(private readonly overviewAdminService: OverviewAdminService) {}

  @Get('user-analytics')
  getUserAnalytics() {
    return this.overviewAdminService.getUserAnalytics();
  }

  @Post('all-gateway-analytics')
  getAllGatewayAnalytics(@Body() body: FiltersDto) {
    return this.overviewAdminService.getAllGatewayAnalytics(body);
  }

  @Post('gateway-member-channel-analytics')
  getGatewayMemberChannelAnalytics(@Body() body: FiltersDto) {
    return this.overviewAdminService.getGatewayMemberChannelAnalytics(body);
  }

  @Post('phonepe-analytics')
  getPhonePeAnalytics(@Body() body: FiltersDto) {
    return this.overviewAdminService.getPhonePeAnalytics(body);
  }

  @Post('razorpay-analytics')
  getRazorPayAnalytics(@Body() body: FiltersDto) {
    return this.overviewAdminService.getRazorPayAnalytics(body);
  }

  @Post('all-channel-analytics')
  getAllChannelAnalytics(@Body() body: FiltersDto) {
    return this.overviewAdminService.getAllChannelAnalytics(body);
  }

  @Post('upi-analytics')
  getUpiAnalytics(@Body() body: FiltersDto) {
    return this.overviewAdminService.getUpiAnalytics(body);
  }

  @Post('netbanking-analytics')
  getNetBankingAnalytics(@Body() body: FiltersDto) {
    return this.overviewAdminService.getNetBankingAnalytics(body);
  }

  @Post('ewallet-analytics')
  getEWalletAnalytics(@Body() body: FiltersDto) {
    return this.overviewAdminService.getEWalletAnalytics(body);
  }

  @Post('balances-commissions-profits')
  getBalancesCommissionsAndProfit(@Body() body: FiltersDto) {
    return this.overviewAdminService.getBalancesCommissionsAndProfit(body);
  }

  @Post('payin-analytics')
  getPayinAnalytics(@Body() body: FiltersDto) {
    return this.overviewAdminService.getPayinAnalytics(body);
  }

  @Post('payout-analytics')
  getPayoutAnalytics(@Body() body: FiltersDto) {
    return this.overviewAdminService.getPayoutAnalytics(body);
  }

  @Post('withdrawal-analytics')
  getWithdrawalAnalytics(@Body() body: FiltersDto) {
    return this.overviewAdminService.getWithdrawalAnalytics(body);
  }

  @Post('topup-analytics')
  getTopupAnalytics(@Body() body: FiltersDto) {
    return this.overviewAdminService.getTopupAnalytics(body);
  }
}
