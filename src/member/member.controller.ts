import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberRegisterDto, MemberUpdateDto } from './dto/member.dto';

@Controller('member')
export class MemberController {
  constructor(private memberService: MemberService) {}

  // POST Requests
  @Post('register')
  async registerMember(@Body() memberRegisterData: MemberRegisterDto) {
    return this.memberService.registerMember(memberRegisterData);
  }

  // GET Reuqests
  @Get('/:user_name')
  async getUserByUserName(@Param('user_name') user_name: string) {
    return this.memberService.getMemberByUserName(user_name);
  }

  @Get()
  async getAllMerchants() {
    return this.memberService.getAllMembers();
  }

  @Patch('/:user_name')
  async updateMerchant(
    @Param('user_name') user_name: string,
    @Body() memberUpdateData: MemberUpdateDto,
  ) {
    return await this.memberService.updateMemberDetails(
      memberUpdateData,
      user_name,
    );
  }

  @Delete('/:user_name')
  async deleteMember(@Param('user_name') user_name: string) {
    return await this.memberService.deleteOneMember(user_name);
  }
}
