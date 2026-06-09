import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const frontendUrl = configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000'

  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
  })

  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )

  const port = configService.get<string>('PORT') ?? '3001'
  await app.listen(port)
  console.log(`API running on http://localhost:${port}`)
}

bootstrap()
