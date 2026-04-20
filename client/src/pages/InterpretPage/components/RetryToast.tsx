import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, X } from 'lucide-react';

export const showRetryToast = (onRetry: () => void, onClose?: () => void) => {
  // 使用 sonner 的 toast 函数，但返回一个自定义的 JSX 元素
  // 在实际实现中，这会与 sonner 的 toast 集成
  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-destructive rounded-full mr-2 animate-pulse" />
          <span className="text-sm font-medium text-foreground">解签生成失败</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">
        解读生成过程中出现错误，请稍后重试
      </p>
      
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onRetry}
          className="flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <RotateCcw className="h-3 w-3" />
          重试
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          取消
        </Button>
      </div>
    </div>
  );
};

// 这个组件主要用于展示自定义 toast 的样式
// 实际使用时，showRetryToast 函数应该与 sonner 的 toast 集成
export const RetryToast: React.FC<{
  onRetry: () => void;
  onClose?: () => void;
}> = ({ onRetry, onClose }) => {
  return showRetryToast(onRetry, onClose);
};