import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useFortuneStore } from '@/stores/fortuneStore';
import { ThoughtInput } from './components/ThoughtInput';
import { MoodSelector } from './components/MoodSelector';
import { SeasonFeelInput } from './components/SeasonFeelInput';

import { logger } from '@lark-apaas/client-toolkit/logger';

export default function InfoCollectionPage() {
  const navigate = useNavigate();
  const { formData, setFormData, resetFormData } = useFortuneStore();
  const [showForm, setShowForm] = React.useState(false);

  const handleThoughtChange = (thought: string) => {
    setFormData({ thought });
  };

  const handleMoodChange = (mood: string) => {
    setFormData({ mood });
  };

  const handleSeasonFeelChange = (seasonFeel: string) => {
    setFormData({ seasonFeel });
  };



  const isFormValid = () => {
    return formData.thought.length >= 10 && formData.thought.length <= 50 && 
           formData.mood.length > 0;
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;

    logger.info('用户提交信息采集表单', {
      thoughtLength: formData.thought.length,
      mood: formData.mood,
      hasSeasonFeel: formData.seasonFeel.length > 0
    });

    // 跳转到抽签动画页
    navigate('/draw');
  };

  // 组件挂载时清空表单数据
  React.useEffect(() => {
    resetFormData();
    logger.info('表单数据已重置为空');
  }, [resetFormData]);

  const handleEnterApp = () => {
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* 背景渐变效果 */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"></div>
      
      {/* 动态光效 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-primary rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Loading首屏 */}
        {!showForm ? (
          <div className="text-center space-y-12">
            <div className="flex flex-col items-center">
              <div className="h-12 w-px bg-primary mb-4"></div>
              <h1 className="text-5xl font-serif font-bold text-primary writing-mode-vertical-rl">
                问心卜运
              </h1>
              <div className="h-12 w-px bg-primary mt-4"></div>
            </div>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
               探索内心深处的智慧
            </p>
            <Button
              onClick={handleEnterApp}
              className="h-16 px-12 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold text-xl rounded-full shadow-2xl shadow-gold hover:shadow-gold-glow hover:scale-110 transition-all duration-300"
              size="lg"
            >
              算一卦
            </Button>
          </div>
        ) : (
          <>

            
            {/* 输入卡片 */}
            <Card className="w-full max-w-md backdrop-blur-md bg-card/60 border border-primary/20 shadow-2xl shadow-gold">
              <CardContent className="p-8 space-y-8">
                <ThoughtInput
                  value={formData.thought}
                  onChange={handleThoughtChange}
                />
                
                <MoodSelector
                  value={formData.mood}
                  onChange={handleMoodChange}
                />
                
                <SeasonFeelInput
                  value={formData.seasonFeel}
                  onChange={handleSeasonFeelChange}
                />
                

                
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                  className="w-full h-14 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold text-lg rounded-full shadow-lg shadow-gold hover:shadow-gold-glow hover:scale-105 transition-all duration-300"
                  size="lg"
                >
                  开始
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      

    </div>
  );
}