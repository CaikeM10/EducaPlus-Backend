import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalInterceptors(
    new RequestLoggingInterceptor(),
    new ResponseEnvelopeInterceptor(),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port =
    Number(process.env.PORT) || configService.get<number>('PORT') || 3000;

  await app.listen(port);

  console.log(`🚀 Servidor rodando na porta ${port}`);
}

void bootstrap();
