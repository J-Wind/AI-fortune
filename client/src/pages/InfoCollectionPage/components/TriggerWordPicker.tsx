import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sparkles } from 'lucide-react';

interface TriggerWordPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const triggerWordPool = [
  '月光', '山川', '旅途', '镜像', '回声', '种子', '潮汐', '星辰',
  '风铃', '露珠', '云海', '篝火', '河流', '梦境', '曙光', '落叶'
];

export function TriggerWordPicker({ value, onChange }: TriggerWordPickerProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);

  const generateRandomOptions = () => {
    const shuffled = [...triggerWordPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const handleShowOptions = () => {
    const newOptions = generateRandomOptions();
    setCurrentOptions(newOptions);
    setShowOptions(true);
    // 如果当前没有选择，默认选择第一个
    if (!value) {
      onChange(newOptions[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium text-left">
          随机触发词
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShowOptions}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          随机生成
        </Button>
      </div>

      {showOptions ? (
        <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
          {currentOptions.map((word) => (
            <div key={word} className="flex items-center space-x-2">
              <RadioGroupItem value={word} id={word} />
              <Label htmlFor={word} className="cursor-pointer font-medium text-left">
                {word}
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          <p className="text-sm">点击"随机生成"按钮获取触发词</p>
        </div>
      )}

      <p className="text-sm text-muted-foreground text-left">
        用于增加神秘感和偶然性，为AI生成提供灵感
      </p>
    </div>
  );
}