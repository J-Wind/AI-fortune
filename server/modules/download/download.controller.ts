import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { DownloadService } from './download.service';

@ApiTags('download')
@Controller('api/download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get('app')
  @ApiOkResponse({
    description: 'Returns the complete AI Fortune app source code as a zip file',
    content: {
      'application/zip': {},
    },
  })
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename="ai-fortune-export.zip"')
  async downloadApp(@Res() res: Response) {
    const zipBuffer = await this.downloadService.generateAppZip();
    res.end(zipBuffer);
  }
}
