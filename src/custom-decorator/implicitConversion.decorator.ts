import { Transform } from 'class-transformer';

export function BooleanTransform(target: any, propertyKey: string | symbol) {
  return Transform((value) => {
    value.options.enableImplicitConversion = false;
    return value.obj[propertyKey];
  })(target, propertyKey);
}
