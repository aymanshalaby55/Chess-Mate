import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable HTTP request logging
  app.use(morgan('dev'));
  
  // Enable cookie parser middleware
  app.use(cookieParser());
  
  // Enable CORS for frontend requests
  app.enableCors({
    origin: ['http://localhost:3000'], // Replace with your frontend URL
    credentials: true,
  });
  
  // Set global API prefix
  app.setGlobalPrefix('api');
  
  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have decorators
      transform: true, // Transform payloads to DTOs
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
    })
  );
  
  // Start the server
  await app.listen(process.env.PORT ?? 4040);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
