import { Injectable, Inject } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { callCapabilities } from '@server/capabilities/ai_text_generate_fortune_interpretation';

interface InterpretationResult {
  seasonEcho: string; // 时节呼应
  hexagramWisdom: string; // 卦象智慧
  specificGuide: string; // 具体指引
  actionAdvice: string; // 行动建议
}

@Injectable()
export class FortuneInterpretationService {
  private readonly logger = new Logger(FortuneInterpretationService.name);

  async generateInterpretation(fortuneText: string): Promise<InterpretationResult> {
    try {
      this.logger.log('开始生成AI深度解签', { fortuneText: fortuneText.substring(0, 50) + '...' });

      // 调用AI深度解签Capability
      const result = await callCapabilities({
        fortune_text: fortuneText
      });

      if (result.code !== 0) {
        throw new Error(`AI深度解签失败: ${result.message}`);
      }

      if (!result.data?.output?.response) {
        throw new Error('AI深度解签返回结果为空');
      }

      const aiResponse = result.data.output.response;
      this.logger.log('AI深度解签返回结果', { 
        responseLength: aiResponse.length,
        preview: aiResponse.substring(0, 100) + '...'
      });

      // 解析AI返回的文本，提取各个部分
      const interpretation = this.parseInterpretationResponse(aiResponse);
      
      this.logger.log('AI深度解签生成成功');
      return interpretation;

    } catch (error) {
      this.logger.error('AI深度解签生成失败', { 
        error: error instanceof Error ? error.message : '未知错误',
        fortuneText: fortuneText.substring(0, 50) + '...'
      });
      throw error;
    }
  }

  private parseInterpretationResponse(response: string): InterpretationResult {
    // 解析AI返回的文本，提取四个模块的内容
    // 仅以模块标题为截断判断标准，不进行任何内容截断
    // AI返回的文本格式应该是：
    // 1. 时节呼应：...
    // 2. 卦象智慧：...
    // 3. 具体指引：...
    // 4. 行动建议：...

    const lines = response.split('\n').filter(line => line.trim());
    
    let seasonEcho = '';
    let hexagramWisdom = '';
    let specificGuide = '';
    let actionAdvice = '';

    let currentSection = '';
    
    for (const line of lines) {
      if (line.includes('时节呼应')) {
        currentSection = 'seasonEcho';
        seasonEcho = line.replace(/^[\d.\s]*时节呼应[：:]*\s*/, '');
      } else if (line.includes('卦象智慧')) {
        currentSection = 'hexagramWisdom';
        hexagramWisdom = line.replace(/^[\d.\s]*卦象智慧[：:]*\s*/, '');
      } else if (line.includes('具体指引')) {
        currentSection = 'specificGuide';
        specificGuide = line.replace(/^[\d.\s]*具体指引[：:]*\s*/, '');
      } else if (line.includes('行动建议')) {
        currentSection = 'actionAdvice';
        actionAdvice = line.replace(/^[\d.\s]*行动建议[：:]*\s*/, '');
      } else {
        // 继续添加到当前部分，不进行任何内容截断
        switch (currentSection) {
          case 'seasonEcho':
            seasonEcho += '\n' + line;
            break;
          case 'hexagramWisdom':
            hexagramWisdom += '\n' + line;
            break;
          case 'specificGuide':
            specificGuide += '\n' + line;
            break;
          case 'actionAdvice':
            actionAdvice += '\n' + line;
            break;
          default:
            // 如果没有明确的部分，默认为时节呼应
            seasonEcho += '\n' + line;
        }
      }
    }

    // 如果AI返回的格式不符合预期，使用默认值
    if (!seasonEcho.trim()) {
      seasonEcho = '当前时节与签文相呼应，反映了您内心的季节感受和情感波动。';
    }
    if (!hexagramWisdom.trim()) {
      hexagramWisdom = '易经卦象蕴含着深刻的智慧，指导您在当前情境下的思考方向。';
    }
    if (!specificGuide.trim()) {
      specificGuide = '针对您当前的具体情况，建议您在以下方面多加关注和调整。';
    }
    if (!actionAdvice.trim()) {
      actionAdvice = '请根据签文含义自行判断行动方向，保持积极心态。';
    }

    return {
      seasonEcho: seasonEcho.trim(),
      hexagramWisdom: hexagramWisdom.trim(),
      specificGuide: specificGuide.trim(),
      actionAdvice: actionAdvice.trim()
    };
  }
}