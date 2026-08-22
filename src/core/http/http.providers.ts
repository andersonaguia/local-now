import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE, Reflector } from '@nestjs/core';

export const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
});

export const httpProviders = [
  {
    provide: APP_PIPE,
    useValue: validationPipe,
  },
  {
    provide: APP_INTERCEPTOR,
    useFactory: (reflector: Reflector) =>
      new ClassSerializerInterceptor(reflector, {
        excludeExtraneousValues: true,
      }),
    inject: [Reflector],
  },
];
