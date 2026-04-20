import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

export function ImageViewer({ isOpen, onClose, imageUrl, alt = "图片" }: ImageViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-4xl" 
        showCloseButton={false}
        onInteractOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        <DialogTitle className="sr-only">查看大图</DialogTitle>
        <DialogDescription className="sr-only">
          {alt}
        </DialogDescription>
        
        {/* 自定义关闭按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10 bg-background/80 backdrop-blur-sm border border-border/50"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
        
        {/* 图片内容 */}
        <div className="relative">
          <img
            src={imageUrl}
            alt={alt}
            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}