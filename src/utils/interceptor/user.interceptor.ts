import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { extractToken, verifyToken } from '../utils';

export class UserInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    try {
      const decodedToken: any = await verifyToken(extractToken(token));

      request.user = decodedToken;
    } catch (error) {
      request.user = null;
    }

    return next.handle();
  }
}
