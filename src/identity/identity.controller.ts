import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentitySigninDto } from './dto/identity.dto';
import { Response } from 'express';

@Controller('identity')
export class IdentityController {
  constructor(private identityService: IdentityService) {}

  @Post('sign-in')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() signinData: IdentitySigninDto,
  ) {
    const jwt = await this.identityService.signIn(signinData);
    response.cookie('token', `Bearer_${jwt}`);
    return { message: 'Sign in successful.' };
  }
}
