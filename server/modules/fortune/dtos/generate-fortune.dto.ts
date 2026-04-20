import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class GenerateFortuneRequestDto {
  @ApiProperty({ description: '用户当前心境或想法' })
  @IsNotEmpty()
  @IsString()
  @IsDefined()
  userMood: string;
}

export class GenerateFortuneResponseDto {
  @ApiProperty({ description: '生成是否成功' })
  success: boolean;

  @ApiProperty({ description: '签号', required: false })
  number?: string;

  @ApiProperty({ description: '主签文', required: false })
  mainText?: string;

  @ApiProperty({ description: '文化引用', required: false })
  culturalReference?: string;

  @ApiProperty({ description: '卦象', required: false })
  hexagram?: string;

  @ApiProperty({ description: '原始AI响应', required: false })
  rawResponse?: string;

  @ApiProperty({ description: '提示信息', required: false })
  message?: string;
}