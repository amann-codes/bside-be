import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger } from '@nestjs/common';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from "@nestjs/config"

async function bootstrap(): Promise<{ port: number }> {

  const app: INestApplication = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true
  });

  const configService: ConfigService<any, boolean> = app.get(ConfigService);
  const appConfig = configService.get('app')

  {
    app.setGlobalPrefix('api')
  }

  {
    const options = appConfig.loggerLevel;
    app.useLogger(options)
  }

  {
    app.enableCors({
      origin: ["http://localhost:3000", "https://side--b.vercel.app"],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  }

  await app.listen(appConfig.port);
  return appConfig;
}
bootstrap().then((appConfig) => {
  Logger.log(`Running at http://localhost:${appConfig.port}`, 'Bootstrap');
})