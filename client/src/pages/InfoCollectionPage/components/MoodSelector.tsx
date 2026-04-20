import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MoodSelectorProps {
  value: string;
  onChange: (value: string) => void;
  showError?: boolean;
}

const moodOptions = [
  { value: '平静如水', label: '平静如水', description: '心如止水，安详平和' },
  { value: '欣喜雀跃', label: '欣喜雀跃', description: '心情愉悦，充满期待' },
  { value: '忧思萦怀', label: '忧思萦怀', description: '思绪万千，略有忧虑' },
  { value: '困顿迷茫', label: '困顿迷茫', description: '前路不明，需要指引' },
  { value: '期待满怀', label: '期待满怀', description: '充满希望，期待未来' },
];

export function MoodSelector({ value, onChange, showError = false }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium text-left w-full">
        当前心境 <span className="text-destructive">*</span>
      </Label>
      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {moodOptions.map((mood) => (
          <div key={mood.value} className="flex items-start space-x-3">
            <RadioGroupItem value={mood.value} id={mood.value} />
            <Label htmlFor={mood.value} className="flex flex-col cursor-pointer text-left items-start">
              <span className="font-medium">{mood.label}</span>
              <span className="text-sm text-muted-foreground text-left">{mood.description}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
      {showError && !value && (
        <p className="text-sm text-destructive text-left">
          请选择当前心境
        </p>
      )}
    </div>
  );
}