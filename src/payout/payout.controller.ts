import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { PayoutAdminService } from './payout-admin.service';
import { PayoutMemberService } from './payout-member.service';
import { PayoutMerchantService } from './payout-merchant.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import { Repository } from 'typeorm';

@Controller('payout')
export class PayoutController {
  constructor(
    @InjectRepository(Submerchant)
    private readonly submerchantRepository: Repository<Submerchant>,

    private readonly payoutService: PayoutService,
    private readonly payoutAdminService: PayoutAdminService,
    private readonly payoutMemberService: PayoutMemberService,
    private readonly payoutMerchantService: PayoutMerchantService,
  ) {}

  @Post()
  @Roles(Role.MERCHANT, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  async create(
    @Req() request,
    @Body() createPayoutDto: CreatePayoutDto,
    @UserInReq() user,
  ) {
    let clientIp = request.headers['x-forwarded-for'] as string;

    const isSubMerchant = user?.type?.includes('SUB');

    let subMerchant = null;

    if (isSubMerchant)
      subMerchant = await this.submerchantRepository.findOne({
        where: { id: user.id },
        relations: ['merchant'],
      });

    const merchantId = subMerchant ? subMerchant.merchant.id : user.id;

    return this.payoutService.create(createPayoutDto, merchantId, clientIp);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
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
  @Roles(Role.MERCHANT, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  async merchantPayouts(
    @Body() paginateRequestDto: PaginateRequestDto,
    @UserInReq() user,
  ) {
    const isSubMerchant = user?.type?.includes('SUB');

    let subMerchant = null;

    if (isSubMerchant)
      subMerchant = await this.submerchantRepository.findOne({
        where: { id: user.id },
        relations: ['merchant'],
      });

    const merchantId = subMerchant ? subMerchant.merchant.id : user.id;

    return this.payoutMerchantService.paginate(paginateRequestDto, +merchantId);
  }

  @Post('merchant-user/paginate')
  @Roles(Role.MERCHANT, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  async merchantUserPayouts(
    @Body() paginateRequestDto: PaginateRequestDto,
    @UserInReq() user,
  ) {
    const isSubMerchant = user?.type?.includes('SUB');

    let subMerchant = null;

    if (isSubMerchant)
      subMerchant = await this.submerchantRepository.findOne({
        where: { id: user.id },
        relations: ['merchant'],
      });

    const merchantId = subMerchant ? subMerchant.merchant.id : user.id;

    return this.payoutMerchantService.paginateMerchantUsers(
      paginateRequestDto,
      +merchantId,
    );
  }

  @Get('merchant-user/details/:userId')
  @Roles(Role.MERCHANT, Role.SUB_MERCHANT)
  @UseGuards(RolesGuard)
  async merchantUserDetails(@Param('userId') userId: string) {
    return this.payoutMerchantService.confirmAndGetEndUserDetails(userId);
  }

  @Post('member/paginate')
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  memberPayouts(
    @Body() paginateRequestDto: PaginateRequestDto,
    @UserInReq() user,
  ) {
    return this.payoutMemberService.paginate(paginateRequestDto, user.id);
  }

  @Get('admin/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  getPayoutOrderDetailsAdmin(@Param('id') id: string) {
    return this.payoutAdminService.getPayoutDetails(id);
  }

  @Get('merchant/:id')
  @Roles(Role.MERCHANT, Role.SUB_MERCHANT)
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
  @Roles(Role.MEMBER)
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
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  updatePayoutStatusToFailed(@Body() body) {
    return this.payoutService.updatePayoutStatusToFailed(body);
  }

  @Post('update-status-submitted')
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  updatePayoutStatusToSubmitted(@Body() body) {
    return this.payoutService.updatePayoutStatusToSubmitted(body);
  }

  @Put('success-notification/:id')
  @Roles(Role.AGENT, Role.MERCHANT, Role.MEMBER)
  @UseGuards(RolesGuard)
  handleNotificationStatusSuccess(@Param('id') id: string) {
    return this.payoutService.handleNotificationStatusSuccess(id);
  }
}
