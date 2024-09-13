import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException('Invalid credentials');
    }

    try {
      const userData = this.jwtService.verifyToken(this.extractToken(token));
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
  extractToken(token: string) {
    return token.split(' ')[1];
  }
}
