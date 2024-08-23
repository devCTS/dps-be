import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberRegistrationDto } from './dto/member.dto';
import { Response } from 'express';

@Controller('member')
export class MemberController {
  constructor(private memberService: MemberService) {}

  @Post('register')
  async registerMember(
    @Body() registrationDetails: MemberRegistrationDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const jwt = await this.memberService.registerMember(registrationDetails);
    response.cookie('member_token', jwt);
    return { token: jwt, message: 'member added', status: HttpStatus.CREATED };
  }
}
