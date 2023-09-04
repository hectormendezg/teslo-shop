import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('API');

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  //await app.listen(3000);
  await app.listen(process.env.PORT);
  //console.log(`Servidor corriendon http://localhost:${process.env.PORT}`);
  logger.log(`Servidor corriendon http://localhost:${process.env.PORT}`);
}
bootstrap();
