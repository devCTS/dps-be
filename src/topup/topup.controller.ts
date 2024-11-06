import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TopupService } from './topup.service';
import { CreateTopupDto } from './dto/create-topup.dto';
import { UpdateTopupDto } from './dto/update-topup.dto';
import { TopupAdminService } from './topup-admin.service';
import { TopupMemberService } from './topup-member.service';
import { PaginateRequestDto } from 'src/utils/dtos/paginate.dto';

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

  @Get()
  findAll() {
    return this.topupService.findAll();
  }

  @Get('current-topup-details')
  getCurrentTopupDetails() {
    return this.topupService.getCurrentTopupDetails();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topupService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTopupDto: UpdateTopupDto) {
    return this.topupService.update(+id, updateTopupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.topupService.remove(+id);
  }

  @Post('admin/paginate')
  adminPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.topupAdminService.paginate(paginateRequestDto);
  }

  @Post('member/paginate')
  memberPayins(@Body() paginateRequestDto: PaginateRequestDto) {
    return this.topupMemberService.paginate(paginateRequestDto);
  }

  @Get('admin/:id')
  getPayinOrderDetailsAdmin(@Param('id') id: string) {
    return this.topupAdminService.getTopupDetails(id);
  }

  @Get('member/:id')
  getPayinOrderDetailsMember(@Param('id') id: string) {
    return this.topupMemberService.getTopupDetails(id);
  }

  @Post('update-status-assigned')
  updatePayinStatusToAssigned(@Body() body) {
    return this.topupService.updateTopupStatusToAssigned(body);
  }

  @Post('update-status-complete')
  updatePayinStatusToCompleted(@Body() body) {
    return this.topupService.updateTopupStatusToComplete(body);
  }

  @Post('update-status-failed')
  updatePayinStatusToFailed(@Body() body) {
    return this.topupService.updateTopupStatusToFailed(body);
  }

  @Post('update-status-submitted')
  updatePayinStatusToSubmitted(@Body() body) {
    return this.topupService.updateTopupStatusToSubmitted(body);
  }
}
