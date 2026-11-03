
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import express from 'express';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Folder for uploaded product images
  const uploadsPath = join(process.cwd(), 'uploads');

  // Create the folder if it does not exist
  mkdirSync(uploadsPath, { recursive: true });

  // Serve uploaded images through /uploads
  app.use(
    '/uploads',
    express.static(uploadsPath),
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
