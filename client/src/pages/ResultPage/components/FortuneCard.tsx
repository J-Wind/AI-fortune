import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FortuneResult } from '@/stores/fortuneStore';

interface FortuneCardProps {
  fortune: FortuneResult;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export function FortuneCard({ fortune, cardRef }: FortuneCardProps) {
  return (
    <div className="relative max-w-md mx-auto" ref={cardRef}>

      {/* 吉凶等级标识 */}
      <div className="text-center mb-3">
        <div className="text-lg font-bold text-primary font-serif relative inline-flex items-center">
          <div className="w-6 h-px bg-primary/40 mr-2"></div>
          {fortune.fortune || '上上签'}
          <div className="w-6 h-px bg-primary/40 ml-2"></div>
        </div>
      </div>

      {/* 主签文卡片 */}
      <Card className="relative bg-paper border-2 border-primary/30 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-paper-texture opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 border-2 border-primary/20 pointer-events-none"></div>
        
        <CardContent className="p-4 relative z-10 flex justify-center items-center" style={{ minHeight: '320px', maxHeight: '360px' }}>
          {/* 签文内容 - 竖排布局，从右到左 */}
          <div className="writing-mode-vertical-rl text-right space-y-3 text-foreground font-serif">
            {/* 签号 + 主签文 */}
            <div className="text-base leading-normal tracking-wide">
              【{fortune.number}】{fortune.mainText}
            </div>
            
            {/* 文化引用 */}
            <div className="text-xs text-muted-foreground italic leading-normal">
              {fortune.culturalReference}
            </div>
            
            {/* 卦象 */}
            <div className="text-xs text-muted-foreground font-medium leading-normal">
              {fortune.hexagram}
            </div>
          </div>
          
          {/* 印章元素 - 左下角 */}
          <div className="absolute bottom-3 left-3">
            <div className="w-9 h-9 border-2 border-primary/50 rounded-full flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <span className="text-[10px] text-primary font-serif">天机</span>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
