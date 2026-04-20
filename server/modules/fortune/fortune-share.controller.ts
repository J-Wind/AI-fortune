import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import type { Request } from 'express';
import { FortuneShareService } from './fortune-share.service';

class ShareRequestDto {
  @ApiProperty({ description: '签文标题' })
  title: string;

  @ApiProperty({ description: '签文内容' })
  content: string;

  @ApiProperty({ description: '深度解读摘要' })
  summary: string;

  @ApiProperty({ description: 'AI图片链接' })
  imageUrl: string;
}

class ShareResponseDto {
  @ApiProperty({ description: '操作是否成功' })
  success: boolean;

  @ApiProperty({ description: '操作结果消息' })
  message: string;

  @ApiProperty({ description: '额外数据', required: false })
  data?: any;
}

@ApiTags('fortune')
@Controller('api/fortune')
export class FortuneShareController {
  constructor(private readonly fortuneShareService: FortuneShareService) {}

  @Post('share')
  @ApiOperation({ summary: '分享解签结果到飞书' })
  @ApiResponse({ status: 200, description: '分享成功', type: ShareResponseDto })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async shareFortune(
    @Req() req: Request,
    @Body() shareData: ShareRequestDto
  ): Promise<ShareResponseDto> {
    const userId = (req as any).userContext?.userId || 'anonymous';
    return this.fortuneShareService.shareToFeishu(shareData, userId);
  }
}