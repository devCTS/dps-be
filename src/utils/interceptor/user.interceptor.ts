import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from 'src/integrations/jwt/jwt.service';

export class UserInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    const jwtService = new JwtService();

    try {
      const decodedToken: any = jwtService.verifyToken(token);

      request.user = decodedToken;
    } catch (error) {
      request.user = null;
    }

    return next.handle();
  }
}
