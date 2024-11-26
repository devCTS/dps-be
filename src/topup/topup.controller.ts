import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TopupService } from './topup.service';
import { CreateTopupDto } from './dto/create-topup.dto';
import { TopupAdminService } from './topup-admin.service';
import { TopupMemberService } from './topup-member.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';
import { Roles } from 'src/utils/decorators/roles.decorator';
import { Role } from 'src/utils/enum/enum';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { UserInReq } from 'src/utils/decorators/user-in-req.decorator';

@Controller('topup')
export class TopupController {
  constructor(
    private readonly topupService: TopupService,
    private readonly topupAdminService: TopupAdminService,
    private readonly topupMemberService: TopupMemberService,
  ) {}

  @Post()
  create(@Body() createTopupDto: CreateTopupDto) {
    return this.topupService.create(createTopupDto);
  }

  @Get('current-topup-details')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  getCurrentTopupDetails() {
    return this.topupService.getCurrentTopupDetails();
  }

  @Get(':id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.topupService.findOne(id);
  }

  @Post('admin/paginate')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  adminPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.topupAdminService.paginate(paginateRequestDto);
  }

  @Post('member/paginate')
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  memberPayins(
    @Body() paginateRequestDto: PaginateRequestDto,
    @UserInReq() user,
  ) {
    return this.topupMemberService.paginate(paginateRequestDto, +user.id);
  }

  @Get('admin/:id')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  getPayinOrderDetailsAdmin(@Param('id') id: string) {
    return this.topupAdminService.getTopupDetails(id);
  }

  @Get('member/:id')
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  getPayinOrderDetailsMember(@Param('id') id: string) {
    return this.topupMemberService.getTopupDetails(id);
  }

  @Post('update-status-assigned')
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  updatePayinStatusToAssigned(@Body() body) {
    return this.topupService.updateTopupStatusToAssigned(body);
  }

  @Post('update-status-complete')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  updatePayinStatusToCompleted(@Body() body) {
    return this.topupService.updateTopupStatusToComplete(body);
  }

  @Post('update-status-failed')
  @Roles(Role.SUB_ADMIN, Role.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  updatePayinStatusToFailed(@Body() body) {
    return this.topupService.updateTopupStatusToFailed(body);
  }

  @Post('update-status-submitted')
  @Roles(Role.MEMBER)
  @UseGuards(RolesGuard)
  updatePayinStatusToSubmitted(@Body() body) {
    return this.topupService.updateTopupStatusToSubmitted(body);
  }

  @Put('success-notification/:id')
  handleNotificationStatusSuccess(@Param('id') id: string) {
    return this.topupService.handleNotificationStatusSuccess(id);
  }
}
