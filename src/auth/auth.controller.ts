import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/auth.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async registerMember(
    @Body() userCreds: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const jwt = await this.authService.loginUser(userCreds);
    response.cookie('member_token', jwt);
    return {
      message: 'Login Successful',
    };
  }
}
