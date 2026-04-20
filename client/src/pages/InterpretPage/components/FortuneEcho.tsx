import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FortuneResult } from '@/stores/fortuneStore';

interface FortuneEchoProps {
  fortune: FortuneResult;
}

export function FortuneEcho({ fortune }: FortuneEchoProps) {
  return (
    <div className="relative">
      {/* 完整签文内容 */}
      <Card className="bg-card/50 backdrop-blur-md border border-primary/20 rounded-xl hover:bg-card/70 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <div className="text-primary font-serif">📜</div>
              </div>
               <div>
                 <div className="text-lg font-bold text-primary font-serif">
                   原签文回顾
                 </div>
               </div>
            </div>
          </div>
          
          {/* 完整签文展示 */}
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-primary font-serif mb-4">
              {fortune.number}
            </div>
            
            {/* 主签文 */}
            <div className="text-xl text-foreground font-serif leading-loose mb-4">
              {fortune.mainText}
            </div>
            
            {/* 文化引用 */}
            <div className="text-sm text-muted-foreground italic leading-relaxed mb-3">
              {fortune.culturalReference}
            </div>
            
            {/* 卦象 */}
            <div className="text-sm text-muted-foreground font-medium">
              {fortune.hexagram}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}