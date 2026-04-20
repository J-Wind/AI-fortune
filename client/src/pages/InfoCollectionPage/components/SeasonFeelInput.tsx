import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SeasonFeelInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SeasonFeelInput({ value, onChange }: SeasonFeelInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="seasonFeel" className="text-base font-medium text-left">
        时节感受
      </Label>
      <Textarea
        id="seasonFeel"
        placeholder="此时此地，你感受到的季节气息（选填）"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[80px] resize-none"
      />
      <p className="text-sm text-muted-foreground text-left">
        用于引入自然意象，增强运势解读的个性化
      </p>
    </div>
  );
}