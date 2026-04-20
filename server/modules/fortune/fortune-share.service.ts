import { Injectable } from '@nestjs/common';
import { callCapabilities } from '@server/capabilities/feishu_send_fortune_result';

interface ShareResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable()
export class FortuneShareService {
  async shareToFeishu(shareData: { title: string; content: string; summary: string; imageUrl: string }, userId: string): Promise<ShareResponse> {
    try {
      if (!userId) {
        throw new Error('未获取到当前用户信息');
      }

      // 调用飞书消息发送Capability
      const result = await callCapabilities({
        title: shareData.title || '签文结果',
        content: shareData.content || '',
        summary: shareData.summary || '',
        image_url: shareData.imageUrl || '',
        user_id: userId
      });

      // 检查Capability执行结果
      if (result.data && result.data.outcome === 'error') {
        const errorBody = JSON.parse(result.data.failureOutput?.response?.body || '{}');
        throw new Error(`飞书消息发送失败: ${errorBody.msg || '未知错误'}`);
      }

      if (result.code !== 0) {
        throw new Error(`飞书消息发送失败: ${result.message || '未知错误'}`);
      }

      return {
        success: true,
        message: '解签结果已发送到飞书',
        data: result
      };
    } catch (error) {
      // 发送飞书消息失败
      throw new Error(`发送飞书消息失败: ${error.message}`);
    }
  }
}