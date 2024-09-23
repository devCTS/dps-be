import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MemberReferralService } from './member-referral.service';
import { CreateMemberReferralDto } from './dto/create-member-referral.dto';
import { UpdateMemberReferralDto } from './dto/update-member-referral.dto';

@Controller('member-referral')
export class MemberReferralController {
  constructor(private readonly memberReferralService: MemberReferralService) {}

  @Post()
  create(@Body() createMemberReferralDto: CreateMemberReferralDto) {
    return this.memberReferralService.create(createMemberReferralDto);
  }

  @Get()
  findAll() {
    return this.memberReferralService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberReferralService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberReferralDto: UpdateMemberReferralDto) {
    return this.memberReferralService.update(+id, updateMemberReferralDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberReferralService.remove(+id);
  }
}
