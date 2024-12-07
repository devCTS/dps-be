import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserInReq = createParamDecorator(
  async (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    // const token = request.headers.authorization;

    // if (!token) return null;

    // const verifiedToken: any = await verifyToken(extractToken(token));

    // return verifiedToken;
    return request.user;
  },
);
