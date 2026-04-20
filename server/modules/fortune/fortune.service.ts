import { Injectable, Logger } from "@nestjs/common";
import { callCapabilities } from "@server/capabilities/ai_image_generate_mysterious_oriental";

@Injectable()
export class FortuneService {
  private readonly logger = new Logger(FortuneService.name);

  async generateFortuneImage(
    fortuneText: string,
    imageRatio: string = "1:1",
    userId: string
  ): Promise<{ success: boolean; imageUrl?: string; message?: string }> {
    try {
      this.logger.log(`用户 ${userId} 请求生成签文图片`, {
        fortuneTextLength: fortuneText.length,
        imageRatio
      });

      // 调用AI图片生成Capability
      const result = await callCapabilities({
        fortune_text: fortuneText,
        image_ratio: imageRatio
      });

      if (result.code === 0 && result.data?.output?.images?.length > 0) {
        const imageUrl = result.data.output.images[0];
        
        this.logger.log(`签文图片生成成功`, {
          userId,
          imageUrl,
          fortuneTextLength: fortuneText.length
        });

        return {
          success: true,
          imageUrl,
          message: "图片生成成功"
        };
      } else {
        this.logger.warn(`签文图片生成失败`, {
          userId,
          code: result.code,
          message: result.message
        });

        return {
          success: false,
          message: result.message || "图片生成失败"
        };
      }
    } catch (error) {
      this.logger.error(`签文图片生成异常`, {
        userId,
        error: error instanceof Error ? error.message : "未知错误",
        fortuneTextLength: fortuneText.length
      });

      return {
        success: false,
        message: "图片生成服务暂时不可用"
      };
    }
  }
}