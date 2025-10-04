import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpException, ValidationPipe } from '@nestjs/common';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
  const config = new DocumentBuilder()
    .setTitle('Bank API')
    .setDescription('API de cuentas, transacciones y auth')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Bank API Docs',
  });
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
