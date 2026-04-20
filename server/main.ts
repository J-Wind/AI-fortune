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

  // 注册静态文件服务 (JS, CSS, images 等)
  app.useStaticAssets(join(process.cwd(), 'dist/client'));

  // 注册视图引擎, 渲染 HTML 文件
  // build.sh 将 HTML 移动到 dist/dist/client/ 目录
  app.setBaseViewsDir(join(process.cwd(), 'dist/dist/client'));
  app.setViewEngine('html');
  app.engine('html', hbsExpressEngine);

  await app.listen(port, host);
  logger.log(`Server running on ${host}:${port}`);
  logger.log(`API endpoints ready at http://${host}:${port}/api`);
}

bootstrap();
