import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpException, ValidationPipe } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
      validationError: { target: false, value: false },
      exceptionFactory: (errors) => {
        return new HttpException(
          {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
            details: errors.map((e) => ({
              field: e.property,
              constraints: e.constraints,
            })),
          },
          400,
        );
      },
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
