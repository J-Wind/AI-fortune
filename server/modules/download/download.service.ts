import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const archiver = require('archiver');

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);

  private readonly configFiles = [
    'package.json',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'rspack.config.js',
    'postcss.config.js',
    'eslint.config.js',
    'nest-cli.json',
    'tailwind.config.ts',
  ];

  private readonly directories = [
    { src: 'client', dest: 'client' },
    { src: 'server', dest: 'server' },
    { src: 'scripts', dest: 'scripts' },
  ];

  async generateAppZip(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const output = archiver('zip', { zlib: { level: 9 } });

      output.on('data', (chunk: Buffer) => chunks.push(chunk));
      output.on('end', () => resolve(Buffer.concat(chunks)));
      output.on('error', (err) => {
        this.logger.error('Archiver error', err);
        reject(err);
      });

      const rootDir = process.cwd();

      for (const file of this.configFiles) {
        const filePath = path.join(rootDir, file);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath);
          output.append(content, { name: file });
        }
      }

      for (const dir of this.directories) {
        const dirPath = path.join(rootDir, dir.src);
        if (fs.existsSync(dirPath)) {
          output.directory(dirPath, dir.dest);
        }
      }

      output.finalize();
    });
  }
}
