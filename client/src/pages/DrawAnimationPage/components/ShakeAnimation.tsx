import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { fortuneTextControllerGenerateFortuneText } from '@/api/gen';

interface ShakeAnimationProps {
  onAnimationComplete: (fortune: any) => void;
  userMood: string;
}

const fortunePool = [
  {
    number: '上上签',
    mainText: '花开富贵，心想事成。贵人相助，事业通达。',
    culturalReference: '《诗经》有云："桃之夭夭，灼灼其华。之子于归，宜其室家。"',
    hexagram: '乾卦 - 天行健，君子以自强不息'
  },
  {
    number: '中吉签',
    mainText: '静待时机，厚积薄发。守得云开见月明。',
    culturalReference: '《道德经》曰："上善若水，水善利万物而不争。"',
    hexagram: '坤卦 - 地势坤，君子以厚德载物'
  },
  {
    number: '上吉签',
    mainText: '福星高照，喜气盈门。机缘巧合，收获满满。',
    culturalReference: '《论语》云："有朋自远方来，不亦乐乎？"',
    hexagram: '泰卦 - 天地交泰，万物亨通'
  },
  {
    number: '中平签',
    mainText: '平淡是真，守成是福。静心修身，待时而动。',
    culturalReference: '《中庸》曰："君子中庸，小人反中庸。"',
    hexagram: '艮卦 - 艮其止，止其所也'
  },
  {
    number: '下签',
    mainText: '否极泰来，转机将至。耐心等待，终见曙光。',
    culturalReference: '《易经》云："穷则变，变则通，通则久。"',
    hexagram: '否卦 - 天地不交，万物不通'
  }
];

export function ShakeAnimation({ onAnimationComplete, userMood }: ShakeAnimationProps) {
  const animationControls = useAnimation();
  const [isAnimating, setIsAnimating] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true); // 控制动画组件的显示/隐藏
  const [fortune, setFortune] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false); // AI签文生成状态
  const hasCompletedRef = useRef(false); // 使用 ref 来跟踪完成状态，避免重复触发

  useEffect(() => {
    // 启动摇签动画循环
    const startShakeAnimation = async () => {
      await animationControls.start({
        rotate: [0, -45, 45, -30, 30, 0],
        y: [0, -30, 30, -20, 20, 0],
        transition: {
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity
        }
      });
    };

    startShakeAnimation();
  }, [animationControls]);

   useEffect(() => {
    // 添加调试日志，确认useEffect被触发
    logger.info('ShakeAnimation useEffect 触发', { 
      hasCompleted: hasCompletedRef.current,
      userMood: userMood 
    });
    
    // 如果已经完成，直接返回
    if (hasCompletedRef.current) return;
    
    let aiFortuneResult: any = null;

    const generateAIFortune = async () => {
      setIsGenerating(true);
      try {
        logger.info('开始生成AI签文', { userMood });
        
        // 添加调试日志，确认函数被调用
        logger.info('准备调用AI签文生成API');
        
        // 调用AI签文生成API
        logger.info('开始调用 fortuneTextControllerGenerateFortuneText API');
        const response = await fortuneTextControllerGenerateFortuneText({
          body: {
            mood: userMood
          }
        });
        
        logger.info('AI签文生成API调用完成', { 
          status: response.status,
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : []
        });

        if (response.data?.success) {
          aiFortuneResult = {
            number: response.data.number || '上上签',
            mainText: response.data.mainText || '花开富贵，心想事成。',
            culturalReference: response.data.culturalReference || '《易经》有云："天行健，君子以自强不息。"',
            hexagram: response.data.hexagram || '乾卦 - 天行健，君子以自强不息',
            isAI: true
          };
          
          setFortune(aiFortuneResult);
          logger.info('AI签文生成成功', { fortuneNumber: aiFortuneResult.number });
          
          // 签文生成成功，立即停止动画并跳转
          triggerAnimationComplete(aiFortuneResult);
        } else {
          // AI生成失败，使用默认签文
          const randomIndex = Math.floor(Math.random() * fortunePool.length);
          const defaultFortune = fortunePool[randomIndex];
          aiFortuneResult = defaultFortune;
          setFortune(defaultFortune);
          logger.warn('AI签文生成失败，使用默认签文', { 
            message: response.data?.message || '未知错误',
            fortuneNumber: defaultFortune.number 
          });
          
          // 使用默认签文时也立即停止动画
          triggerAnimationComplete(defaultFortune);
        }
      } catch (error) {
        // AI调用异常，使用默认签文
        const randomIndex = Math.floor(Math.random() * fortunePool.length);
        const defaultFortune = fortunePool[randomIndex];
        aiFortuneResult = defaultFortune;
        setFortune(defaultFortune);
        
        logger.error('AI签文生成异常', {
          error: error instanceof Error ? error.message : '未知错误',
          fortuneNumber: defaultFortune.number
        });
        
        // 异常情况下也立即停止动画
        triggerAnimationComplete(defaultFortune);
      } finally {
        setIsGenerating(false);
      }
    };

    // 删除 checkAnimationAndComplete 函数，直接使用 triggerAnimationComplete

    const triggerAnimationComplete = async (fortuneData: any) => {
      if (hasCompletedRef.current) return; // 防止重复触发
      hasCompletedRef.current = true;
      
      // 停止动画循环
      await animationControls.stop();
      
      // 启动优雅淡出动画
      setTimeout(() => {
        setShowAnimation(false);
        
        // 在淡出动画完成后触发回调
        setTimeout(() => {
          onAnimationComplete(fortuneData);
          logger.info('抽签动画完成', {
            fortuneNumber: fortuneData.number,
            isAI: fortuneData.isAI || false
          });
        }, 500); // 淡出动画持续时间
      }, 300); // 延迟开始淡出，让用户看到完成状态
    };

    // 页面加载时立即开始生成签文
    logger.info('准备调用 generateAIFortune 函数');
    generateAIFortune();
    logger.info('generateAIFortune 函数调用完成');

    return () => {
      // 清理函数，当前无需额外清理
    };
  }, [onAnimationComplete, userMood, animationControls]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 粒子系统 */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {showAnimation && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            {/* 签筒容器 */}
            <motion.div
              className="relative"
              animate={animationControls}
            >
              {/* 签筒 */}
              <div className="w-32 h-48 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-primary/40 relative overflow-hidden shadow-2xl">
                {/* 竹纹效果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
                <div className="absolute top-4 left-4 right-4 h-px bg-primary/20"></div>
                <div className="absolute top-8 left-4 right-4 h-px bg-primary/15"></div>
                <div className="absolute top-12 left-4 right-4 h-px bg-primary/10"></div>
                
                {/* 签条飞出动画 */}
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  initial={{ y: 0, opacity: 0 }}
                  animate={{
                    y: isAnimating ? [-200, -150, -100] : -100,
                    opacity: isAnimating ? [0, 1, 0] : 0,
                    rotate: isAnimating ? [0, 180, 360] : 360
                  }}
                  transition={{
                    duration: 1.2,
                    ease: "easeOut"
                  }}
                >
                  <div className="w-6 h-32 bg-gradient-to-b from-amber-100 to-amber-50 rounded-sm border border-amber-200 shadow-lg">
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full"></div>
                  </div>
                </motion.div>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-primary text-lg font-serif">签</div>
              </div>
            </motion.div>
            
            {/* 状态文案 */}
            <motion.div
              className="mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.p
                className="text-lg text-primary font-serif mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {isGenerating ? "签文生成中..." : "摇签中..."}
              </motion.p>
              <motion.p
                className="text-sm text-muted-foreground"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                {isGenerating ? "天机正在降临..." : "签已出..."}
              </motion.p>
              <motion.p
                className="text-xs text-muted-foreground mt-1"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2 }}
              >
                {isGenerating ? "请稍候..." : "解读天意..."}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}