import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ValidationExceptionFilter } from './utils/exception-filters/errorMap';
import { CleanRequestInterceptor } from './utils/interceptor/clean-request.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  // app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new CleanRequestInterceptor(),
  );

  // app.useGlobalFilters(new ValidationExceptionFilter());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
