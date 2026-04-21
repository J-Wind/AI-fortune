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

const generateDefaultFortune = (thought: string, mood: string, seasonFeel: string) => {
  const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  const randomTianGan = tianGan[Math.floor(Math.random() * tianGan.length)];
  const randomDiZi = diZhi[Math.floor(Math.random() * diZhi.length)];
  const signNumber = `${randomTianGan}${randomDiZi}签`;

  let fortune = '中吉签';
  let mainText = '';
  let culturalReference = '';
  let hexagram = '';

  if (thought.includes('工作') || thought.includes('事业') || thought.includes('职场') || thought.includes('升职') || thought.includes('加薪')) {
    fortune = '上吉签';
    mainText = `${mood === '焦虑' ? '云开雾散见晴天' : '鹏程万里展宏图'}，${thought.includes('升职') ? '青云直上步高升' : '功成名就指日待'}。莫道征途多险阻，${seasonFeel ? seasonFeel.slice(0, 2) : '春风'}得意马蹄疾。`;
    culturalReference = `《易经·乾卦》曰："天行健，君子以自强不息。"白话解：天道运行刚劲强健，君子应效法天道，奋发图强，永不停息。`;
    hexagram = '乾卦 ☰☰';
  } else if (thought.includes('感情') || thought.includes('爱情') || thought.includes('恋爱') || thought.includes('婚姻') || thought.includes('对象') || thought.includes('伴侣')) {
    fortune = mood === '焦虑' ? '中吉签' : '上上签';
    mainText = `${mood === '期待' ? '月下花前遇良缘' : '红线暗牵两心连'}，${thought.includes('婚姻') ? '琴瑟和鸣百年好' : '此去花开并蒂莲'}。${mood === '焦虑' ? '莫愁前路无知己' : '天赐良缘终有日'}，${seasonFeel ? seasonFeel.slice(0, 2) : '佳偶'}天成共婵娟。`;
    culturalReference = `《易经·咸卦》曰："咸，亨，利贞。"白话解：感应相通，事物和谐顺畅。感情之事需两心相悦，自然水到渠成。`;
    hexagram = '咸卦 ☶☱';
  } else if (thought.includes('考试') || thought.includes('学业') || thought.includes('学习') || thought.includes('成绩') || thought.includes('升学')) {
    fortune = '上吉签';
    mainText = `寒窗苦读志如钢，笔走龙蛇意气扬。金榜题名终有日，${seasonFeel || '春风'}得意马蹄香。`;
    culturalReference = `《易经·蒙卦》曰："匪我求童蒙，童蒙求我。"白话解：不是我去求幼童学习，而是幼童来求我教导。求学需主动积极，方能有所成就。`;
    hexagram = '蒙卦 ☵☶';
  } else if (thought.includes('健康') || thought.includes('身体') || thought.includes('病') || thought.includes('医') || thought.includes('养生')) {
    fortune = mood === '焦虑' ? '中平签' : '上吉签';
    mainText = `${mood === '焦虑' ? '身心康泰福寿长' : '否极泰来转乾坤'}，${thought.includes('病') ? '药到病除体安康' : '精气神足百病消'}。静心调养待时机，${seasonFeel || '秋月'}春风皆宜人。`;
    culturalReference = `《易经·颐卦》曰："颐，贞吉。"白话解：养正则吉。注重调养身心，顺应自然规律，健康自然随之而来。`;
    hexagram = '颐卦 ☳☷';
  } else if (thought.includes('财运') || thought.includes('钱') || thought.includes('投资') || thought.includes('生意') || thought.includes('财富')) {
    fortune = '上上签';
    mainText = `财源广进达三江，商机无限聚八方。积少成多终致富，${seasonFeel || '金秋'}硕果满庭芳。`;
    culturalReference = `《易经·坤卦》曰："地势坤，君子以厚德载物。"白话解：大地的气势厚实和顺，君子应增厚美德，容载万物。财富需以德为基础。`;
    hexagram = '坤卦 ☷☷';
  } else {
    fortune = ['上上签', '上吉签', '中吉签'][Math.floor(Math.random() * 3)];
    
    const poems = [
      `${thought || '心之所念'}化云烟，${mood || '平静'}如水映青天。${seasonFeel || '四季'}轮回皆有道，守得云开见月明。`,
      `${mood === '焦虑' ? '拨开迷雾见青天' : '顺风顺水扬帆起'}，${thought ? thought.slice(0, 4) : '心想事成'}在眼前。莫愁前路无知己，${seasonFeel || '春暖花开'}好运连。`,
      `天时地利与人和，${thought || '万事'}顺遂乐呵呵。静待时机成大器，${seasonFeel || '秋风送爽'}奏凯歌。`
    ];
    
    mainText = poems[Math.floor(Math.random() * poems.length)];
    culturalReference = `《易经》有云："积善之家，必有余庆。"白话解：积累善行的人家，必然会有多余的福报。心存善念，自有天佑。`;
    hexagram = ['泰卦 ☰☷', '既济卦 ☵☲', '益卦 ☳☴'][Math.floor(Math.random() * 3)];
  }

  return {
    fortune,
    number: signNumber,
    mainText,
    culturalReference,
    hexagram,
    isAI: false
  };
};

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
            mainText: response.data.mainText || generateDefaultFortune(userThought, userMood, seasonFeel).mainText,
            culturalReference: response.data.culturalReference || generateDefaultFortune(userThought, userMood, seasonFeel).culturalReference,
            hexagram: response.data.hexagram || generateDefaultFortune(userThought, userMood, seasonFeel).hexagram,
            isAI: true
          };
        } else {
          logger.warn('AI 返回非成功状态，使用基于用户输入的默认签文');
          fortuneResult = generateDefaultFortune(userThought, userMood, seasonFeel);
        }

      } catch (error) {
        logger.error('AI 签文生成异常，使用基于用户输入的默认签文', { error: error instanceof Error ? error.message : '未知错误' });
        fortuneResult = generateDefaultFortune(userThought, userMood, seasonFeel);
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
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* 背景氛围 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>
      <div className="absolute inset-0 opacity-5">
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
            className="text-center w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="relative w-full flex justify-center"
              animate={animationControls}
              style={{ transformOrigin: 'center center' }}
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
