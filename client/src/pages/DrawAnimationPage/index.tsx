import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFortuneStore } from '@/stores/fortuneStore';
import { ShakeAnimation } from './components/ShakeAnimation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { fortuneControllerGenerateImage, fortuneTextControllerGenerateFortuneText } from '@/api/gen';

export default function DrawAnimationPage() {
  const navigate = useNavigate();
  const { formData, setFortuneResult } = useFortuneStore();
  const [showAnimation, setShowAnimation] = useState(true);
  const [showLoadingText, setShowLoadingText] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // AI签文生成状态

  useEffect(() => {
    // 检查是否有必要的数据，如果没有则跳回首页
    if (!formData.thought || !formData.mood) {
      logger.warn('用户未填写完整信息，跳转回首页');
      navigate('/');
      return;
    }

    // 禁用浏览器返回按钮
    const handleBackButton = (event: PopStateEvent) => {
      event.preventDefault();
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [formData, navigate]);

  const handleAnimationComplete = async (fortune: any) => {
    // 防止重复调用
    if (!showAnimation) return;
    
    // 显示签文获取中提示
    setShowLoadingText(true);
    setIsGenerating(true);
    
    try {
      // 生成签文配套图片（16:9 banner样式）
      const imageResult = await fortuneControllerGenerateImage({
        body: {
          fortuneText: fortune.mainText,
          imageRatio: "16:9"
        }
      });

      // 存储签文结果（包含生成的图片URL）
      setFortuneResult({
        ...fortune,
        userInput: formData,
        imageUrl: imageResult.data?.imageUrl
      });

      logger.info('抽签完成，图片生成成功', {
        fortuneNumber: fortune.number,
        thoughtLength: formData.thought.length,
        mood: formData.mood,
        hasImage: !!imageResult.data?.imageUrl
      });
    } catch (error) {
      // 如果图片生成失败，仍然存储签文结果
      setFortuneResult({
        ...fortune,
        userInput: formData
      });

      logger.warn('抽签完成，图片生成失败', {
        fortuneNumber: fortune.number,
        error: error instanceof Error ? error.message : '未知错误'
      });
    }

    // 动画结束后直接跳转到结果页
    setShowAnimation(false);
    setShowLoadingText(false);
    setIsGenerating(false);
    navigate('/fortune-result');
  };





  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-primary rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        {showAnimation && (
          <ShakeAnimation 
            onAnimationComplete={handleAnimationComplete} 
            userMood={formData.mood}
          />
        )}
        
        {/* 签文获取中提示 */}
        {!showAnimation && showLoadingText && (
          <div className="text-center">
            <div className="text-2xl font-bold text-primary font-serif mb-2">
              签文获取中...
            </div>
            <div className="text-sm text-muted-foreground font-serif">
              天机正在降临，请稍候
            </div>
          </div>
        )}
        

      </div>
    </div>
  );
}