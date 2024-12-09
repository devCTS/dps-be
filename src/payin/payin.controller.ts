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
import { Submerchant } from 'src/sub-merchant/entities/sub-merchant.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePaymentOrderDtoAdmin } from 'src/payment-system/dto/createPaymentOrder.dto';

@Controller('payin')
export class PayinController {
  constructor(
    @InjectRepository(Submerchant)
    private readonly submerchantRepository: Repository<Submerchant>,
    private payinAdminService: PayinAdminService,
    private payinMemberService: PayinMemberService,
    private payinMerchantService: PayinMerchantService,
    private payinService: PayinService,
  ) {}

  @Post()
  create(@Body() createPayinDto) {
    return this.payinService.create(createPayinDto);
  }

  @Post('create-by-admin')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  createAndAssign(@Body() createPayinDto: CreatePaymentOrderDtoAdmin) {
    return this.payinService.createAndAssign(createPayinDto);
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
  async merchantPayins(
    @UserInReq() user,
    @Body() paginateRequestDto: PaginateRequestDto,
  ) {
    const isSubMerchant = user?.type?.includes('SUB');

    let subMerchant = null;

    if (isSubMerchant)
      subMerchant = await this.submerchantRepository.findOne({
        where: { id: user.id },
        relations: ['merchant'],
      });

    const merchantId = subMerchant ? subMerchant.merchant.id : user.id;

    return this.payinMerchantService.paginatePayins(
      +merchantId,
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
    return this.payinMemberService.paginatePayins(user.id, paginateRequestDto);
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
  updatePayinStatusToAssigned(@Body() body) {
    return this.payinService.updatePayinStatusToAssigned(body);
  }

  @Post('update-status-complete')
  // @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  // @UseGuards(RolesGuard)
  updatePayinStatusToCompleted(@Body() body) {
    return this.payinService.updatePayinStatusToComplete(body);
  }

  @Post('update-status-failed')
  updatePayinStatusToFailed(@Body() body) {
    return this.payinService.updatePayinStatusToFailed(body);
  }

  @Post('update-status-submitted')
  updatePayinStatusToSubmitted(@Body() body) {
    return this.payinService.updatePayinStatusToSubmitted(body);
  }

  @Put('success-callback/:id')
  handleCallbackStatusSuccess(@Param('id') id: string) {
    return this.payinService.handleCallbackStatusSuccess(id);
  }

  @Get('merchant-list')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  getMerchantList() {
    return this.payinAdminService.getMerchantList();
  }

  @Get('member-list')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  getMemberList() {
    return this.payinAdminService.getMemberList();
  }

  @Get('enduser-suggestions/:id')
  @Roles(Role.SUPER_ADMIN, Role.SUB_ADMIN)
  @UseGuards(RolesGuard)
  getEnduserIdSuggestions(@Param('id') id: number) {
    return this.payinAdminService.getEndUserIdSuggestions(id);
  }
}
