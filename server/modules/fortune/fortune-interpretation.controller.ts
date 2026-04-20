import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiExtraModels } from '@nestjs/swagger';
import { FortuneInterpretationService } from './fortune-interpretation.service';
import { GenerateInterpretationRequestDto, GenerateInterpretationResponseDto } from './dtos/fortune-interpretation.dto';
import type { Request } from 'express';

@ApiTags('Fortune Interpretation')
@ApiExtraModels(GenerateInterpretationResponseDto)
@Controller('api/fortune')
export class FortuneInterpretationController {
  constructor(
    private readonly fortuneInterpretationService: FortuneInterpretationService
  ) {}

  @Post('/generate-interpretation')
  @ApiOperation({
    summary: '生成AI深度解签',
    description: '根据签文内容生成时节呼应、卦象智慧、具体指引、行动建议等完整解签文本'
  })
  @ApiCreatedResponse({ type: GenerateInterpretationResponseDto })
  async generateInterpretation(
    @Req() req: Request,
    @Body() body: GenerateInterpretationRequestDto
  ): Promise<GenerateInterpretationResponseDto> {
    const { userId } = req.userContext;
    
    try {
      const interpretation = await this.fortuneInterpretationService.generateInterpretation(body.fortuneText);
      
      return {
        success: true,
        seasonEcho: interpretation.seasonEcho,
        hexagramWisdom: interpretation.hexagramWisdom,
        specificGuide: interpretation.specificGuide,
        actionAdvice: interpretation.actionAdvice,
        message: '解读生成成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '解读生成失败'
      };
    }
  }
}