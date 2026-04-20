import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Loader2, Eye } from 'lucide-react';
import { useFortuneStore } from '@/stores/fortuneStore';
import { ImageViewer } from './ImageViewer';

export function AiImage() {
  const { fortuneImage } = useFortuneStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // 如果没有图片URL，显示占位图
  if (!fortuneImage) {
    return (
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="p-0 aspect-video flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无AI生成图片</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleImageLoad = () => {
    setIsLoading(false);
    setLoadError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setLoadError(true);
  };

  const handleImageClick = () => {
    if (!isLoading && !loadError) {
      setIsViewerOpen(true);
    }
  };

  return (
    <>
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300" onClick={handleImageClick}>
        <CardContent className="p-0 aspect-video relative">
          {/* 加载状态 */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* 图片内容 */}
          <div className="relative w-full h-full">
            <img
              src={fortuneImage}
              alt="AI生成签文配图"
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            
            {/* 图片加载失败 */}
            {loadError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                <div className="text-center text-muted-foreground">
                  <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">图片加载失败</p>
                </div>
              </div>
            )}

            {/* 悬浮查看按钮 */}
            {!isLoading && !loadError && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background/80 backdrop-blur-sm border border-border/50"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  查看大图
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 大图查看弹窗 */}
      <ImageViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        imageUrl={fortuneImage}
        alt="AI生成签文配图"
      />
    </>
  );
}