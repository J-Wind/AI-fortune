import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFortuneStore } from '@/stores/fortuneStore';
import { FortuneCard } from './components/FortuneCard';
import { Download, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { fortuneInterpretationControllerGenerateInterpretation } from '@/api/gen';

export default function ResultPage() {
  const navigate = useNavigate();
  const { fortuneResult, setInterpretationResult } = useFortuneStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingInterpretation, setIsGeneratingInterpretation] = useState(false);

  useEffect(() => {
    // 检查是否有签文结果，如果没有则跳回首页
    if (!fortuneResult) {
      logger.warn('用户未抽签，跳转回首页');
      navigate('/');
      return;
    }

    logger.info('用户查看签文结果', {
      fortuneNumber: fortuneResult.number,
      thoughtLength: fortuneResult.userInput.thought.length
    });
  }, []); // 移除 fortuneResult 依赖，只在组件挂载时检查一次

  const handleSaveImage = async () => {
    if (!cardRef.current || isSaving) return;

    setIsSaving(true);
    
    try {
      // 动态导入 html2canvas，避免打包时包含
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: getComputedStyle(cardRef.current).backgroundColor,
        scale: 2, // 提高分辨率
        useCORS: true,
        allowTaint: false,
      });

      // 创建下载链接
      const link = document.createElement('a');
      link.download = `运势签文-${fortuneResult?.number || '未知'}.png`;
      link.href = canvas.toDataURL('image/png');
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 显示成功提示
      toast.success('已保存至相册', {
        description: '签文图片已成功保存到您的设备',
        duration: 3000,
      });

      logger.info('签文图片保存成功', {
        fortuneNumber: fortuneResult?.number
      });
    } catch (error) {
      logger.error('签文图片保存失败', { error });
      toast.error('保存失败', {
        description: '请重试或截图保存',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 调用AI深度解签接口
  const generateInterpretation = async () => {
    if (!fortuneResult) {
      throw new Error('签文数据为空');
    }

    // 构建完整的签文内容
    const fullFortuneText = `
签号：${fortuneResult.number}
主签文：${fortuneResult.mainText}
文化引用：${fortuneResult.culturalReference}
卦象：${fortuneResult.hexagram}

用户心境：${fortuneResult.userInput.mood}
用户所念：${fortuneResult.userInput.thought}
时节感受：${fortuneResult.userInput.seasonFeel}
触发词：${fortuneResult.userInput.triggerWord}
    `.trim();

    logger.info('调用AI深度解签接口', {
      fortuneNumber: fortuneResult.number,
      fortuneTextLength: fullFortuneText.length
    });

    // 调用真实的AI深度解签接口
    const response = await fortuneInterpretationControllerGenerateInterpretation({
      body: {
        fortuneText: fullFortuneText
      }
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`API调用失败，状态码：${response.status}`);
    }

    const apiResponse = response.data;

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'AI深度解签失败');
    }

    // 使用AI返回的真实数据
    return {
      seasonEcho: apiResponse.seasonEcho || '当前时节与签文相呼应，反映了您内心的季节感受和情感波动。',
      hexagramWisdom: apiResponse.hexagramWisdom || '易经卦象蕴含着深刻的智慧，指导您在当前情境下的思考方向。',
      specificGuide: apiResponse.specificGuide || '针对您当前的具体情况，建议您在以下方面多加关注和调整。',
      actionAdvice: apiResponse.actionAdvice || '请根据签文含义自行判断行动方向，保持积极心态。'
    };
  };

  const handleInterpret = () => {
    logger.info('用户点击深度解签，跳转到过渡页', {
      fortuneNumber: fortuneResult?.number
    });
    
    // 直接跳转到过渡页，由过渡页负责调用AI深度解签和生图接口
    navigate('/interpreting');
  };

  if (!fortuneResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden p-4">
      {/* 背景氛围 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-primary rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary font-serif mb-4">
            您的运势签文
          </h1>
          <p className="text-muted-foreground font-serif">
            天机已现，缘起缘落
          </p>
        </div>

        {/* 签文卡片 */}
        <FortuneCard fortune={fortuneResult} cardRef={cardRef} />

        {/* 操作按钮区域 */}
        <div className="space-y-4">
          <Button
            onClick={handleInterpret}
            className="w-full h-14 bg-transparent border-2 border-primary text-primary font-serif text-lg hover:bg-primary/10 transition-all duration-300 hover:scale-105"
            size="lg"
            variant="outline"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            深度解读
          </Button>
        </div>


      </div>
    </div>
  );
}