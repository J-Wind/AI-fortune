import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { FortuneTextService } from './fortune-text.service';
import { GenerateFortuneRequestDto, GenerateFortuneResponseDto } from './dtos/generate-fortune.dto';

@ApiTags('Fortune Text')
@Controller('api/fortune')
export class FortuneTextController {
  constructor(private readonly fortuneTextService: FortuneTextService) {}

  @Post('generate-text')
  @ApiOperation({
    summary: '生成AI签文',
    description: '根据用户心境生成神秘东方风格的AI签文'
  })
  @ApiOkResponse({ type: GenerateFortuneResponseDto })
  async generateFortuneText(
    @Body() body: GenerateFortuneRequestDto
  ): Promise<GenerateFortuneResponseDto> {
    return this.fortuneTextService.generateFortune(body.userMood);
  }
}