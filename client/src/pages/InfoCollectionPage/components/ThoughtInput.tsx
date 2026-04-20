import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ThoughtInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ThoughtInput({ value, onChange }: ThoughtInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= 50) {
      onChange(newValue);
    }
  };

  const characterCount = value.length;
  const isInvalid = characterCount > 0 && characterCount < 10;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="thought" className="text-base font-medium text-left">
          心中所念 <span className="text-destructive">*</span>
        </Label>
        <span className={`text-sm ${isInvalid ? 'text-destructive' : 'text-muted-foreground'} text-left`}>
          {characterCount}/50
        </span>
      </div>
      <Textarea
        id="thought"
        placeholder="此刻你心中所想之事，可以是困惑、期待或愿望（10-50字）"
        value={value}
        onChange={handleChange}
        className={`min-h-[100px] resize-none ${isInvalid ? 'border-destructive' : ''}`}
      />
      {isInvalid && (
        <p className="text-sm text-destructive text-left">
          请输入至少10个字符
        </p>
      )}
      <p className="text-sm text-muted-foreground text-left">
        示例：工作转折、感情抉择、学业规划等
      </p>
    </div>
  );
}