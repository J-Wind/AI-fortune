import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InterpretModuleProps {
  title: string;
  content: string;
}

export const InterpretModule: React.FC<InterpretModuleProps> = ({
  title,
  content
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // 处理文案换行显示 - 添加安全检查
  const safeContent = content || '';
  
  // 处理换行符：将 \n 转换为 <br/> 标签用于显示
  const formattedContent = safeContent.replace(/\n/g, '<br/>');

  return (
    <div className="bg-card/50 rounded-lg border border-border/30 overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-primary font-serif mb-3">{title}</h3>
        
        <AnimatePresence mode="wait">
          {isExpanded ? (
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
              <Button
                variant="link"
                size="sm"
                onClick={handleToggle}
                className="text-primary hover:text-primary/80 mt-2 p-0 h-auto flex items-center"
              >
                <ChevronUp className="w-4 h-4 mr-1" />
                收起
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div 
                className="text-muted-foreground leading-relaxed font-serif whitespace-pre-line line-clamp-3"
                dangerouslySetInnerHTML={{ __html: formattedContent }}
              />
              <Button
                variant="link"
                size="sm"
                onClick={handleToggle}
                className="text-primary hover:text-primary/80 mt-2 p-0 h-auto flex items-center"
              >
                <ChevronDown className="w-4 h-4 mr-1" />
                展开全文
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};