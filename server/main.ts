import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
// import { configureApp } from '@lark-apaas/fullstack-nestjs-core';
import { join } from 'path';
import { __express as hbsExpressEngine } from 'hbs';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // await configureApp(app);
  const logger = new Logger('Bootstrap');
  const host = process.env.SERVER_HOST || '0.0.0.0';
  const port = Number(process.env.SERVER_PORT || process.env.PORT || '3000');

  // 注册静态文件服务
  const isProd = process.env.NODE_ENV === 'production';
  const staticAssetsDir = isProd
    ? join(process.cwd(), 'client')  // prod: cwd is dist/, assets in dist/client/
    : join(process.cwd(), 'dist/client');  // dev: cwd is project root
  app.useStaticAssets(staticAssetsDir);

  // 注册视图引擎, 渲染 client 目录下的 html 文件
  app.setBaseViewsDir(staticAssetsDir);
  app.setViewEngine('html');
  app.engine('html', hbsExpressEngine);

  await app.listen(port, host);
  logger.log(`Server running on ${host}:${port}`);
  logger.log(`API endpoints ready at http://${host}:${port}/api`);
}

bootstrap();
