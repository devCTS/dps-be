import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const secretKey = process.env.AES_KEY;

    return next.handle().pipe(
      map((data) => {
        const encryptedData = CryptoJS.AES.encrypt(
          JSON.stringify(data),
          secretKey,
        ).toString();

        return { encryptedData };
      }),
    );
  }
}
