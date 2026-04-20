import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFortuneStore } from '@/stores/fortuneStore';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { toast } from 'sonner';
import { 
  fortuneInterpretationControllerGenerateInterpretation,
  fortuneControllerGenerateImage 
} from '@/api/gen';
import { ParticleBackground } from './components/ParticleBackground';

export default function InterpretingPage() {
  const navigate = useNavigate();
  const { fortuneResult, setInterpretationResult, setFortuneImage } = useFortuneStore();
  const [loadingText, setLoadingText] = useState('正在为您解读天机...');

  useEffect(() => {
    // 检查是否有签文结果，如果没有则跳回首页
    if (!fortuneResult) {
      logger.warn('用户未抽签，跳转回首页');
      navigate('/');
      return;
    }

    logger.info('开始深度解签流程', {
      fortuneNumber: fortuneResult.number,
      thoughtLength: fortuneResult.userInput.thought.length
    });

    // 并行调用AI深度解签和AI生图接口
    const startInterpretation = async () => {
      try {
        setLoadingText('正在连接天机...');
        
        // 并行调用两个接口
        const [interpretationResponse, imageResponse] = await Promise.allSettled([
          generateInterpretation(),
          generateImage()
        ]);

        // 处理深度解签结果
        if (interpretationResponse.status === 'fulfilled') {
          const interpretation = interpretationResponse.value;
          setInterpretationResult(interpretation);
          logger.info('AI深度解签成功', {
            fortuneNumber: fortuneResult.number
          });
        } else {
          logger.error('AI深度解签失败', { error: interpretationResponse.reason });
          throw new Error('深度解签生成失败');
        }

        // 处理图片生成结果
        if (imageResponse.status === 'fulfilled') {
          const imageUrl = imageResponse.value;
          setFortuneImage(imageUrl);
          logger.info('AI图片生成成功', {
            fortuneNumber: fortuneResult.number,
            imageUrl: imageUrl
          });
        } else {
          logger.warn('AI图片生成失败，但继续流程', { error: imageResponse.reason });
        }

        setLoadingText('天机已现，缘起缘落...');
        
        // 短暂延迟后跳转到解签页面
        setTimeout(() => {
          navigate('/interpret', { replace: true });
        }, 1000);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '解签过程出现异常';
        logger.error('深度解签流程失败', { error });
        
        toast.error('解签生成失败，请重试', {
          description: errorMessage,
          action: {
            label: '返回',
            onClick: () => navigate('/fortune-result')
          }
        });
      }
    };

    startInterpretation();
  }, [fortuneResult, navigate, setInterpretationResult, setFortuneImage]);

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

  // 调用AI生图接口
  const generateImage = async () => {
    if (!fortuneResult) {
      throw new Error('签文数据为空');
    }

    logger.info('调用AI生图接口', {
      fortuneNumber: fortuneResult.number
    });

    // 构建完整的签文内容用于生成图片
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

    // 调用真实的AI生图接口
    const response = await fortuneControllerGenerateImage({
      body: {
        fortuneText: fullFortuneText,
        imageRatio: '4:3'
      }
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`API调用失败，状态码：${response.status}`);
    }

    const apiResponse = response.data;

    if (!apiResponse.success || !apiResponse.imageUrl) {
      throw new Error(apiResponse.message || 'AI图片生成失败');
    }

    return apiResponse.imageUrl;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 背景氛围 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>
      
      {/* 粒子背景动画 */}
      <ParticleBackground />
      
      {/* 宣纸纹理遮罩 */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjNlZCIvPjxwYXRoIGQ9Ik0wIDUwTDUwIDUwTDUwIDEwMEwxMDAgMTAwTDEwMCA1MEw1MCA1MEw1MCAwTDAgMFoiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbGw9Im5vbmUiLz48L3N2Zz4=')] opacity-10"></div>
      
      {/* 主要内容区域 */}
      <div className="relative z-10 min-h-screen grid place-items-center p-4">
        <motion.div 
          className="grid place-items-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* 竖排文字容器 */}
          <motion.div 
            className="grid place-items-center"
            style={{ writingMode: 'vertical-rl' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <h1 className="text-4xl font-bold text-primary font-serif tracking-widest text-center">
              {loadingText}
            </h1>
          </motion.div>
          
          {/* 加载动画 */}
          <motion.div
            className="flex justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.5 
            }}
          >
            <div className="relative">
              {/* 外圈 */}
              <motion.div
                className="w-16 h-16 border-4 border-primary/30 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              
              {/* 内圈 */}
              <motion.div
                className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              
              {/* 中心点 */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
            </div>
          </motion.div>
          
          {/* 底部提示 */}
          <motion.p 
            className="text-sm text-muted-foreground font-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            天机不可泄露，请耐心等待...
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}