import { Injectable } from '@nestjs/common';
import { callCapabilities } from '@server/capabilities/ai_text_generate_oracle';

@Injectable()
export class FortuneTextService {
  async generateFortune(mood: string): Promise<any> {
    try {
      // 调用AI签文生成Capability
      const result = await callCapabilities({ mood });
      
      if (result.code === 0 && result.data?.output?.response) {
        const aiResponse = result.data.output.response;
        
        // 解析AI返回的签文内容
        const parsedFortune = this.parseFortuneResponse(aiResponse);
        
        return {
          success: true,
          ...parsedFortune,
          rawResponse: aiResponse
        };
      } else {
        // 如果AI调用失败，返回默认签文
        return this.getDefaultFortune(mood);
      }
    } catch (error) {
      // 如果出现异常，返回默认签文
      return this.getDefaultFortune(mood);
    }
  }

  private parseFortuneResponse(response: string): any {
    // 简单的解析逻辑，实际应用中需要更复杂的解析
    const lines = response.split('\n').filter(line => line.trim());
    
    // 尝试提取签号 - 改进匹配逻辑
    let number = '上上签'; // 默认改为上上签，避免固定显示甲子
    
    // 多种匹配模式
    const numberMatch = response.match(/【签号】\s*([^\n【]+)/) || 
                       response.match(/签号[:：]\s*([^\n【]+)/) ||
                       response.match(/(第[^签]+签)/) ||
                       response.match(/([上下中]+[上下吉凶平]+签)/);
    
    if (numberMatch && numberMatch[1]) {
      number = numberMatch[1].trim();
    }

    // 尝试提取主签文
    let mainText = '花开富贵，心想事成。贵人相助，事业通达。';
    const mainTextMatch = response.match(/【主签文】\s*([^【]+)/) || 
                         response.match(/主签文[:：]\s*([^\n【]+)/) ||
                         response.match(/([^。]+。[^。]+。[^。]+。[^。]+。)/);
    if (mainTextMatch && mainTextMatch[1]) {
      mainText = mainTextMatch[1].trim();
    }

    // 尝试提取文化引用
    let culturalReference = '《易经》有云："天行健，君子以自强不息。"';
    const referenceMatch = response.match(/【文化引用】\s*([^【]+)/) || 
                          response.match(/文化引用[:：]\s*([^\n【]+)/) ||
                          response.match(/(《[^》]+》[^\n]+)/);
    if (referenceMatch && referenceMatch[1]) {
      culturalReference = referenceMatch[1].trim();
    }

    // 尝试提取卦象
    let hexagram = '乾卦 - 天行健，君子以自强不息';
    const hexagramMatch = response.match(/【卦象】\s*([^\n【]+)/) || 
                         response.match(/卦象[:：]\s*([^\n【]+)/) ||
                         response.match(/([^卦]+卦[^\n]+)/);
    if (hexagramMatch && hexagramMatch[1]) {
      hexagram = hexagramMatch[1].trim();
    }

    return {
      number,
      mainText,
      culturalReference,
      hexagram
    };
  }

  private getDefaultFortune(mood: string): any {
    // 基于用户心境返回不同的默认签文
    const defaultFortunes = [
      {
        number: '上上签',
        mainText: '花开富贵，心想事成。贵人相助，事业通达。',
        culturalReference: '《诗经》有云："桃之夭夭，灼灼其华。之子于归，宜其室家。"',
        hexagram: '乾卦 - 天行健，君子以自强不息'
      },
      {
        number: '中吉签',
        mainText: '静待时机，厚积薄发。守得云开见月明。',
        culturalReference: '《道德经》曰："上善若水，水善利万物而不争。"',
        hexagram: '坤卦 - 地势坤，君子以厚德载物'
      },
      {
        number: '上吉签',
        mainText: '福星高照，喜气盈门。机缘巧合，收获满满。',
        culturalReference: '《论语》云："有朋自远方来，不亦乐乎？"',
        hexagram: '泰卦 - 天地交泰，万物亨通'
      }
    ];

    // 基于用户心境选择签文
    const hash = this.hashString(mood);
    const index = hash % defaultFortunes.length;
    
    return {
      success: false, // 标记为默认签文
      ...defaultFortunes[index],
      message: 'AI签文生成服务暂时不可用，使用默认签文'
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}