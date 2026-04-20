import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface InterpretContentProps {
  interpretation: {
    fortuneEcho: string;
    seasonInterpretation: string;
    hexagramConnection: string;
    specificGuidance: string;
    actionAdvice: string;
  };
}

export function InterpretContent({ interpretation }: InterpretContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const sections = [
    { key: 'fortuneEcho', title: '签文呼应', content: interpretation.fortuneEcho, icon: '📜' },
    { key: 'seasonInterpretation', title: '时节解读', content: interpretation.seasonInterpretation, icon: '🌿' },
    { key: 'hexagramConnection', title: '易经关联', content: interpretation.hexagramConnection, icon: '☯️' },
    { key: 'specificGuidance', title: '具体指引', content: interpretation.specificGuidance, icon: '🧭' },
    { key: 'actionAdvice', title: '行动建议', content: interpretation.actionAdvice, icon: '🚀' },
  ];

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSections(newExpanded);
  };

  const firstSection = sections[0];
  const remainingSections = sections.slice(1);

  return (
    <div className="space-y-6">
      {/* 白话解读主卡片 */}
      <div className="bg-card/50 backdrop-blur-md border border-primary/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <div className="text-primary font-serif">💬</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary font-serif">
              白话解读
            </div>
            <div className="text-sm text-muted-foreground font-serif">
              AI深度解析签文含义
            </div>
          </div>
        </div>

        {/* 第一段始终显示 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="text-primary text-lg">{firstSection.icon}</div>
            <h3 className="text-lg font-semibold text-foreground font-serif">
              {firstSection.title}
            </h3>
          </div>
          <p className="text-foreground leading-relaxed font-serif text-justify">
            {firstSection.content}
          </p>
        </div>

        {/* 后续段落可折叠 */}
        {remainingSections.map((section, index) => {
          const isSectionExpanded = expandedSections.has(section.key);
          const isVisible = isExpanded || isSectionExpanded;
          
          return (
            <div key={section.key} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-primary text-lg">{section.icon}</div>
                  <h3 className="text-lg font-semibold text-foreground font-serif">
                    {section.title}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection(section.key)}
                  className="text-primary border-primary/30 hover:bg-primary/10 font-serif"
                >
                  {isSectionExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {(isExpanded || isSectionExpanded) && (
                <p className="text-foreground leading-relaxed font-serif text-justify">
                  {section.content}
                </p>
              )}
            </div>
          );
        })}

        {/* 全局展开/收起按钮 */}
        {!isExpanded && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(true)}
              className="text-primary border-primary hover:bg-primary/10 font-serif"
            >
              <ChevronDown className="w-4 h-4 mr-2" />
              展开更多解读
            </Button>
          </div>
        )}

        {isExpanded && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(false)}
              className="text-primary border-primary hover:bg-primary/10 font-serif"
            >
              <ChevronUp className="w-4 h-4 mr-2" />
              收起解读
            </Button>
          </div>
        )}
      </div>


    </div>
  );
}