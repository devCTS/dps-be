import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CleanRequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Clean the request body
    request.body = this.cleanObject(request.body);

    return next.handle().pipe(map((data) => data));
  }

  private cleanObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj
        .map((item) => this.cleanObject(item))
        .filter((item) => item !== undefined && item !== null);
    }

    if (obj && typeof obj === 'object') {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === '' ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'object' && Object.keys(value).length === 0)
        ) {
          return acc; // Skip empty values
        }
        acc[key] = this.cleanObject(value); // Recursively clean objects
        return acc;
      }, {});
    }

    return obj; // Return the value as is if it's neither an array nor an object
  }
}
