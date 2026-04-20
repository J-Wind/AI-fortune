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


      {/* 签号标识 */}
      <div className="text-center mb-8">
        <div className="text-2xl font-bold text-primary font-serif relative inline-block">
          {fortune.number}
          {/* 装饰性横线 */}
          <div className="absolute -left-12 top-1/2 w-10 h-px bg-primary/40"></div>
          <div className="absolute -right-12 top-1/2 w-10 h-px bg-primary/40"></div>
        </div>
      </div>

      {/* 主签文卡片 */}
      <Card className="relative bg-paper border-2 border-primary/30 shadow-2xl overflow-hidden">
        {/* 纸质纹理 */}
        <div className="absolute inset-0 bg-paper-texture opacity-20 pointer-events-none"></div>
        
        {/* 金箔边框 */}
        <div className="absolute inset-0 border-2 border-primary/20 pointer-events-none"></div>
        
        <CardContent className="p-8 relative z-10 flex justify-center items-center h-[560px]">
          {/* 签文内容 - 竖排布局 */}
          <div className="writing-mode-vertical-rl text-start space-y-8">
            {/* 主签文 */}
            <div className="text-xl text-foreground font-serif leading-loose">
              {fortune.mainText}
            </div>
            
            {/* 文化引用 */}
            <div className="text-sm text-muted-foreground italic leading-relaxed">
              {fortune.culturalReference}
            </div>
            
            {/* 卦象 */}
            <div className="text-sm text-muted-foreground font-medium">
              {fortune.hexagram}
            </div>
          </div>
          
          {/* 印章元素 */}
          <div className="absolute bottom-4 left-4">
            <div className="w-12 h-12 border-2 border-primary/50 rounded-full flex items-center justify-center">
              <div className="text-xs text-primary font-serif">天机</div>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}