import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFortuneStore } from '@/stores/fortuneStore';
import { FortuneEcho } from './components/FortuneEcho';
import { ShareDialog } from './components/ShareDialog';
import { InterpretModule } from './components/InterpretModule';
import { AiImage } from './components/AiImage';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { fortuneInterpretationControllerGenerateInterpretation } from '@/api/gen';
import { Skeleton } from '@/components/ui/skeleton';

export default function InterpretPage() {
  const navigate = useNavigate();
  const { 
    fortuneResult, 
    interpretationResult,
    setInterpretationResult
  } = useFortuneStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    // 检查是否有签文结果，如果没有则跳回首页
    if (!fortuneResult) {
      logger.warn('用户未抽签，跳转回首页');
      navigate('/');
      return;
    }

     // 检查是否有解读结果，如果没有则跳回签文结果页面
    // 这个检查已经移到单独的 useEffect 中处理

    logger.info('用户进入解签页面', {
      fortuneNumber: fortuneResult.number,
      hasInterpretation: !!interpretationResult
    });
  }, [fortuneResult, interpretationResult, navigate]);

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



  const handleGenerateInterpretation = async () => {
    logger.info('handleGenerateInterpretation 被调用', {
      hasFortuneResult: !!fortuneResult,
      fortuneNumber: fortuneResult?.number
    });
    
    if (!fortuneResult) {
      logger.error('无法生成解读：fortuneResult 为空');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      logger.info('开始生成AI解读', {
        fortuneNumber: fortuneResult.number
      });

      const interpretation = await generateInterpretation();

      logger.info('AI解读生成完成，设置结果', {
        fortuneNumber: fortuneResult.number,
        interpretationKeys: Object.keys(interpretation)
      });

      setInterpretationResult(interpretation);

      toast.success('解读生成成功', {
        description: 'AI已为您深度解读签文含义',
        duration: 3000,
      });

      logger.info('AI解读生成成功', {
        fortuneNumber: fortuneResult.number
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '解读生成失败';
      setError(errorMessage);
      logger.error('AI解读生成失败', { error });
      
      toast.error('解签生成失败，请重试', {
        description: errorMessage,
        action: {
          label: '重试',
          onClick: handleGenerateInterpretation
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 不再自动生成解读，只显示已生成的结果
  
  // 检查是否已有解读结果，如果没有则跳回签文页面
  useEffect(() => {
    if (!interpretationResult) {
      logger.warn('用户未生成解读，跳转回签文页面');
      navigate('/fortune-result');
      return;
    }
  }, [interpretationResult, navigate]);

  const handleBackToResult = () => {
    navigate('/fortune-result');
  };

  // 渲染错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardContent className="p-6 text-center">
            <div className="text-destructive mb-4">
              <Sparkles className="h-12 w-12 mx-auto mb-3" />
              <h2 className="text-xl font-semibold">解读生成失败</h2>
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleGenerateInterpretation} variant="default">
                重试解读
              </Button>
              <Button onClick={() => navigate('/fortune-result')} variant="outline">
                返回签文
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!fortuneResult || !interpretationResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">加载中...</div>
          <Button 
            onClick={() => navigate('/fortune-result')}
            className="mt-4"
            variant="outline"
          >
            返回签文页面
          </Button>
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

        {/* 顶部操作栏 */}
        <div className="relative z-10 max-w-md mx-auto mb-8">
          <div className="flex justify-between items-center">
            <Button
              onClick={handleBackToResult}
              className="bg-transparent border border-primary/30 text-primary hover:bg-primary/10 font-serif"
              size="sm"
            >
              返回签文
            </Button>
            
            {/* 分享按钮 */}
            {fortuneResult && (
              <ShareDialog fortune={fortuneResult} />
            )}
          </div>
        </div>

      <div className="relative z-10 max-w-md mx-auto space-y-8">
        {/* AI生成图片展示 */}
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary font-serif mb-4">
              深度解签
            </h1>
            <p className="text-muted-foreground font-serif">
              天机深意，待君细品
            </p>
          </div>
          
          {/* AI图片展示 */}
          <AiImage />
        </div>

        {/* 签文回显 */}
        <FortuneEcho fortune={fortuneResult} />



        {/* 解读完成提示 */}
        <div className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center text-primary font-serif text-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              AI深度解读已完成
            </div>
            <p className="text-muted-foreground text-sm">请查看下方四个模块的详细解读内容</p>
          </div>
        </div>

        {/* 解读内容展示 */}
        <div className="space-y-4">
          {/* 时节呼应模块 */}
          <InterpretModule 
            title="时节呼应"
            content={interpretationResult.seasonEcho}
          />

          {/* 卦象智慧模块 */}
          <InterpretModule 
            title="卦象智慧"
            content={interpretationResult.hexagramWisdom}
          />

          {/* 具体指引模块 */}
          <InterpretModule 
            title="具体指引"
            content={interpretationResult.specificGuide}
          />

          {/* 行动建议模块 */}
          <InterpretModule 
            title="行动建议"
            content={interpretationResult.actionAdvice}
          />
        </div>

        {/* 底部操作按钮 */}
        <div className="space-y-4">
          <Button
            onClick={handleGenerateInterpretation}
            disabled={isGenerating}
            className="w-full h-14 bg-transparent border-2 border-primary text-primary font-serif text-lg hover:bg-primary/10 transition-all duration-300 hover:scale-105"
            size="lg"
            variant="outline"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                重新生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                重新生成解读
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}