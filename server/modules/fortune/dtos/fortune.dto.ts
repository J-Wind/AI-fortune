import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsDefined, IsString, IsOptional, IsEnum } from "class-validator";

export class GenerateImageRequestDto {
  @ApiProperty({ description: "签文内容" })
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  fortuneText: string;

  @ApiPropertyOptional({ 
    description: "图片比例",
    enum: ["16:9", "3:2", "4:3", "1:1", "2:3", "9:16"],
    default: "1:1"
  })
  @IsOptional()
  @IsEnum(["16:9", "3:2", "4:3", "1:1", "2:3", "9:16"])
  imageRatio?: string = "1:1";
}

export class GenerateImageResponseDto {
  @ApiProperty({ description: "生成是否成功" })
  success: boolean;

  @ApiPropertyOptional({ description: "生成的图片URL" })
  imageUrl?: string;

  @ApiPropertyOptional({ description: "提示信息" })
  message?: string;
}