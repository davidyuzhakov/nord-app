import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { getFrontendOrigin } from './auth/auth.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger(),
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: getFrontendOrigin(),
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
