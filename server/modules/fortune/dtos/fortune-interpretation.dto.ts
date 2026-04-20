import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDefined } from 'class-validator';

export class GenerateInterpretationRequestDto {
  @ApiProperty({ 
    description: '签文内容',
    example: '甲子签：春风得意马蹄疾，一日看尽长安花。此签出自《易经》乾卦，象征刚健进取。'
  })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  fortuneText: string;
}

export class GenerateInterpretationResponseDto {
  @ApiProperty({ 
    description: '生成是否成功',
    example: true
  })
  success: boolean;

  @ApiPropertyOptional({ 
    description: '时节呼应',
    example: '当前时节与签文相呼应，反映了您内心的季节感受和情感波动。'
  })
  @IsOptional()
  @IsString()
  seasonEcho?: string;

  @ApiPropertyOptional({ 
    description: '卦象智慧',
    example: '易经卦象蕴含着深刻的智慧，指导您在当前情境下的思考方向。'
  })
  @IsOptional()
  @IsString()
  hexagramWisdom?: string;

  @ApiPropertyOptional({ 
    description: '具体指引',
    example: '针对您当前的具体情况，建议您在以下方面多加关注和调整。'
  })
  @IsOptional()
  @IsString()
  specificGuide?: string;

  @ApiPropertyOptional({ 
    description: '行动建议',
    example: '建议您在近期重点关注事业发展，主动寻求合作机会，保持积极进取的心态。'
  })
  @IsOptional()
  @IsString()
  actionAdvice?: string;

  @ApiPropertyOptional({ 
    description: '提示信息',
    example: '解读生成成功'
  })
  @IsOptional()
  @IsString()
  message?: string;
}