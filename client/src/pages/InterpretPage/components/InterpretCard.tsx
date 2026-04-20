import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InterpretCardProps {
  title: string;
  content: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const InterpretCard: React.FC<InterpretCardProps> = ({
  title,
  content,
  isExpanded = false,
  onToggle
}) => {
  const [isExpandedInternal, setIsExpandedInternal] = useState(isExpanded);

  const handleToggle = () => {
    setIsExpandedInternal(!isExpandedInternal);
    onToggle?.();
  };

  // 处理文案换行显示 - 添加安全检查
  const safeContent = content || '';
  
  // 处理换行符：将 \n 转换为 <br/> 标签用于显示
  const formattedContent = safeContent.replace(/\n/g, '<br/>');
  
  // 移除基于字符数的截断判断，仅基于标题来决定展开/收起

  return (
    <Card className="bg-card border-border shadow-sm overflow-hidden">
      <CardHeader className="p-4 pb-0">
      </CardHeader>
      
      <CardContent className="p-4">
        <AnimatePresence mode="wait">
          {isExpandedInternal ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div 
                className="text-foreground leading-relaxed font-serif whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: formattedContent }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-muted-foreground leading-relaxed font-serif whitespace-pre-line">{safeContent}</p>
              <Button
                variant="link"
                size="sm"
                onClick={handleToggle}
                className="text-primary hover:text-primary/80 mt-2 p-0 h-auto"
              >
                展开全文
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};