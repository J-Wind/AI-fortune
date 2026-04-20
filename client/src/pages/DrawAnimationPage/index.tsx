import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFortuneStore } from '@/stores/fortuneStore';
import { ShakeAnimation } from './components/ShakeAnimation';
import { logger } from '@lark-apaas/client-toolkit/logger';

export default function DrawAnimationPage() {
  const navigate = useNavigate();
  const { formData, setFortuneResult } = useFortuneStore();

  useEffect(() => {
    if (!formData.thought || !formData.mood) {
      logger.warn('用户未填写完整信息，跳转回首页');
      navigate('/');
      return;
    }

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

  const handleComplete = (fortune: any) => {
    setFortuneResult({
      ...fortune,
      userInput: formData
    });

    logger.info('抽签完成', {
      fortuneNumber: fortune.number,
      thoughtLength: formData.thought.length,
      mood: formData.mood,
      hasImage: !!fortune.imageUrl
    });

    navigate('/fortune-result');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-primary rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <ShakeAnimation 
          onComplete={handleComplete} 
          userMood={formData.mood}
          userThought={formData.thought}
          seasonFeel={formData.seasonFeel}
        />
      </div>
    </div>
  );
}
