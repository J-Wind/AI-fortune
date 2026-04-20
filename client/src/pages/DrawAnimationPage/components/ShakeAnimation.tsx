import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { fortuneTextControllerGenerateFortuneText, fortuneControllerGenerateImage } from '@/api/gen';

interface ShakeAnimationProps {
  onComplete: (fortune: any) => void;
  userMood: string;
  userThought: string;
  seasonFeel: string;
}

const fortunePool = [
  {
    fortune: '上上签',
    number: '甲子签',
    mainText: '花开富贵，心想事成。贵人相助，事业通达。',
    culturalReference: '《诗经》有云："桃之夭夭，灼灼其华。之子于归，宜其室家。"',
    hexagram: '乾卦 ☰☰'
  },
  {
    fortune: '中吉签',
    number: '乙丑签',
    mainText: '静待时机，厚积薄发。守得云开见月明。',
    culturalReference: '《道德经》曰："上善若水，水善利万物而不争。"',
    hexagram: '坤卦 ☷☷'
  },
  {
    fortune: '上吉签',
    number: '丙寅签',
    mainText: '福星高照，喜气盈门。机缘巧合，收获满满。',
    culturalReference: '《论语》云："有朋自远方来，不亦乐乎？"',
    hexagram: '泰卦 ☷☰'
  },
  {
    fortune: '中平签',
    number: '丁卯签',
    mainText: '平淡是真，守成是福。静心修身，待时而动。',
    culturalReference: '《中庸》曰："君子中庸，小人反中庸。"',
    hexagram: '艮卦 ☶☶'
  },
  {
    fortune: '下签',
    number: '戊辰签',
    mainText: '否极泰来，转机将至。耐心等待，终见曙光。',
    culturalReference: '《易经》云："穷则变，变则通，通则久。"',
    hexagram: '否卦 ☷☰'
  }
];

export function ShakeAnimation({ onComplete, userMood, userThought, seasonFeel }: ShakeAnimationProps) {
  const animationControls = useAnimation();
  const [isAnimating, setIsAnimating] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  const [statusText, setStatusText] = useState('摇签中...');
  const [statusSubtext, setStatusSubtext] = useState('天机正在降临...');
  const hasCompletedRef = useRef(false);

  useEffect(() => {
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
    if (hasCompletedRef.current) return;

    const generateAll = async () => {
      let fortuneResult: any = null;

      try {
        setStatusText('签文生成中...');
        setStatusSubtext('天机正在降临...');

        const response = await fortuneTextControllerGenerateFortuneText({
          body: {
            mood: userMood,
            thought: userThought,
            seasonFeel: seasonFeel
          }
        });

        if (response.data?.success) {
          fortuneResult = {
            fortune: response.data.fortune || '上上签',
            number: response.data.number || '庚辰签',
            mainText: response.data.mainText || '花开富贵，心想事成。',
            culturalReference: response.data.culturalReference || '《易经》有云："天行健，君子以自强不息。"',
            hexagram: response.data.hexagram || '乾卦 ☰☰',
            isAI: true
          };
        } else {
          const randomIndex = Math.floor(Math.random() * fortunePool.length);
          fortuneResult = fortunePool[randomIndex];
        }

        setStatusText('绘制灵图中...');
        setStatusSubtext('水墨丹青正在成型...');

        try {
          const imageResult = await fortuneControllerGenerateImage({
            body: {
              fortuneText: fortuneResult.mainText,
              imageRatio: "16:9"
            }
          });
          fortuneResult.imageUrl = imageResult.data?.imageUrl;
        } catch (imageError) {
          logger.warn('图片生成失败', { error: imageError instanceof Error ? imageError.message : '未知错误' });
        }

      } catch (error) {
        logger.error('AI签文生成异常', { error: error instanceof Error ? error.message : '未知错误' });
        const randomIndex = Math.floor(Math.random() * fortunePool.length);
        fortuneResult = fortunePool[randomIndex];
      }

      triggerComplete(fortuneResult);
    };

    const triggerComplete = async (fortuneData: any) => {
      if (hasCompletedRef.current) return;
      hasCompletedRef.current = true;

      await animationControls.stop();

      setTimeout(() => {
        setShowAnimation(false);

        setTimeout(() => {
          onComplete(fortuneData);
        }, 500);
      }, 300);
    };

    generateAll();
  }, [onComplete, userMood, userThought, seasonFeel, animationControls]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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
            <motion.div
              className="relative"
              animate={animationControls}
            >
              <div className="w-32 h-48 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-primary/40 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
                <div className="absolute top-4 left-4 right-4 h-px bg-primary/20"></div>
                <div className="absolute top-8 left-4 right-4 h-px bg-primary/15"></div>
                <div className="absolute top-12 left-4 right-4 h-px bg-primary/10"></div>
                
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
                {statusText}
              </motion.p>
              <motion.p
                className="text-sm text-muted-foreground"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                {statusSubtext}
              </motion.p>
              <motion.p
                className="text-xs text-muted-foreground mt-1"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2 }}
              >
                请稍候...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
