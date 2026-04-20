import { Controller, Post, Body, Req } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, ApiTags, ApiOperation } from "@nestjs/swagger";
import type { Request } from "express";
import { FortuneService } from "./fortune.service";
import { GenerateImageRequestDto, GenerateImageResponseDto } from "./dtos/fortune.dto";

@ApiTags("Fortune")
@ApiExtraModels(GenerateImageResponseDto)
@Controller("api/fortune")
export class FortuneController {
  constructor(private readonly fortuneService: FortuneService) {}

  @Post("/generate-image")
  @ApiOperation({
    summary: "生成签文配套图片",
    description: "根据签文内容生成神秘东方风格的配套图片",
  })
  @ApiOkResponse({ type: GenerateImageResponseDto })
  async generateImage(
    @Req() req: Request,
    @Body() body: GenerateImageRequestDto
  ): Promise<GenerateImageResponseDto> {
    const { userId } = req.userContext;
    
    const result = await this.fortuneService.generateFortuneImage(
      body.fortuneText,
      body.imageRatio,
      userId
    );

    return {
      success: result.success,
      imageUrl: result.imageUrl,
      message: result.message
    };
  }
}