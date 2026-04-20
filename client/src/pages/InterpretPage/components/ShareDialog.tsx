import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Send } from 'lucide-react';
import { FortuneResult } from '@/stores/fortuneStore';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { AiImage } from './AiImage';
import { fortuneShareControllerShareFortune } from '@/api/gen';
import { useFortuneStore } from '@/stores/fortuneStore';

interface ShareDialogProps {
  fortune: FortuneResult;
}

export function ShareDialog({ fortune }: ShareDialogProps) {
  const [isSending, setIsSending] = useState(false);
  const { fortuneImage, interpretationResult } = useFortuneStore();

  const handleShare = async () => {
    try {
      // 模拟分享功能
      if (navigator.share) {
        await navigator.share({
          title: fortune.number,
          text: fortune.mainText,
          url: window.location.href,
        });
      } else {
        // 如果不支持原生分享，复制到剪贴板
        const shareText = `${fortune.number}\n${fortune.mainText}\n文化引用：${fortune.culturalReference}\n卦象：${fortune.hexagram}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('签文内容已复制到剪贴板！');
      }
    } catch (error) {
      logger.error('分享失败', { error });
    }
  };

  const handleSendToFeishu = async () => {
    setIsSending(true);
    try {
      // 准备分享数据
      const shareData = {
        title: fortune.number,
        content: `文化引用：${fortune.culturalReference}\n卦象：${fortune.hexagram}`,
        summary: interpretationResult ? 
          `${interpretationResult.seasonEcho || ''}\n${interpretationResult.hexagramWisdom || ''}\n${interpretationResult.specificGuide || ''}\n${interpretationResult.actionAdvice || ''}`.substring(0, 200) : '暂无深度解读',
        imageUrl: fortuneImage || ''
      };

      // 调用后端API发送飞书消息
      const response = await fortuneShareControllerShareFortune({
        body: shareData
      });

      // 检查响应结构，确保response.data存在
      if (!response || !response.data) {
        throw new Error('API响应为空');
      }

      const responseData = response.data as { success: boolean; message: string };
      if (responseData.success) {
        toast.success('解签结果已发送到飞书！');
      } else {
        throw new Error(responseData.message || '发送失败');
      }
    } catch (error) {
      logger.error('发送飞书消息失败', { error });
      toast.error('发送失败，请重试');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="bg-primary/80 hover:bg-primary text-background font-serif"
          size="sm"
        >
          <Share2 className="w-4 h-4 mr-2" />
          分享
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md bg-card border-border shadow-lg max-h-[90vh] my-[5vh] overflow-y-auto">
        {/* 弹窗标题 */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-primary font-serif">
            分享签文
          </h3>
          <p className="text-sm text-muted-foreground font-serif">
            与好友分享您的运势
          </p>
        </div>

        {/* 内容区域 */}
        <div className="space-y-4">
          {/* AI生成图片 - 16:9比例 */}
          <div className="-mx-6 -mt-6">
            <AiImage />
          </div>

          {/* 签文内容 */}
          <div className="space-y-3 p-4 bg-card/50 rounded-lg border border-border/30">
            {/* 签号 */}
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-serif rounded-full">
                签号：{fortune.number}
              </span>
            </div>

            {/* 主签文 */}
            <div className="text-center">
              <h4 className="text-lg font-bold text-foreground font-serif mb-2">
                主签文
              </h4>
              <p className="text-base leading-relaxed text-foreground font-serif">
                {fortune.mainText}
              </p>
            </div>

            {/* 文化引用 */}
            <div className="text-center">
              <h4 className="text-sm font-semibold text-muted-foreground font-serif mb-1">
                文化引用
              </h4>
              <p className="text-sm italic text-muted-foreground font-serif">
                {fortune.culturalReference}
              </p>
            </div>

            {/* 卦象 */}
            <div className="text-center">
              <h4 className="text-sm font-semibold text-muted-foreground font-serif mb-1">
                卦象
              </h4>
              <p className="text-sm font-medium text-muted-foreground font-serif">
                {fortune.hexagram}
              </p>
            </div>
          </div>
        </div>

        {/* 分享操作按钮 */}
        <div className="mt-4 flex flex-col space-y-4">
          <Button 
            variant="secondary"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-serif"
            size="sm"
            onClick={handleSendToFeishu}
            disabled={isSending}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? '发送中...' : '发送飞书消息给自己'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}