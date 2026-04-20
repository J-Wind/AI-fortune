import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { FortuneResult } from '@/stores/fortuneStore';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { AiImage } from './AiImage';

interface ShareDialogProps {
  fortune: FortuneResult;
}

export function ShareDialog({ fortune }: ShareDialogProps) {
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: fortune.number,
          text: fortune.mainText,
          url: window.location.href,
        });
      } else {
        const shareText = `${fortune.number}\n${fortune.mainText}\n文化引用：${fortune.culturalReference}\n卦象：${fortune.hexagram}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('签文内容已复制到剪贴板！');
      }
    } catch (error) {
      logger.error('分享失败', { error });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="bg-primary/80 hover:bg-primary text-background font-serif"
          size="sm"
        >
          <Share2 className="w-4 h-4 mr-2" />
          分享
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md bg-card border-border shadow-lg max-h-[90vh] my-[5vh] overflow-y-auto">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-primary font-serif">
            分享签文
          </h3>
          <p className="text-sm text-muted-foreground font-serif">
            与好友分享您的运势
          </p>
        </div>

        <div className="space-y-4">
          <div className="-mx-6 -mt-6">
            <AiImage />
          </div>

          <div className="space-y-3 p-4 bg-card/50 rounded-lg border border-border/30">
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-serif rounded-full">
                签号：{fortune.number}
              </span>
            </div>

            <div className="text-center">
              <h4 className="text-lg font-bold text-foreground font-serif mb-2">
                主签文
              </h4>
              <p className="text-base leading-relaxed text-foreground font-serif">
                {fortune.mainText}
              </p>
            </div>

            <div className="text-center">
              <h4 className="text-sm font-semibold text-muted-foreground font-serif mb-1">
                文化引用
              </h4>
              <p className="text-sm italic text-muted-foreground font-serif">
                {fortune.culturalReference}
              </p>
            </div>

            <div className="text-center">
              <h4 className="text-sm font-semibold text-muted-foreground font-serif mb-1">
                卦象
              </h4>
              <p className="text-sm font-medium text-muted-foreground font-serif">
                {fortune.hexagram}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Button 
            variant="secondary"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-serif w-full"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            复制签文内容
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
