import { Injectable } from '@nestjs/common';
import { callCapabilities } from '@server/capabilities/ai_text_generate_oracle';

@Injectable()
export class FortuneTextService {
  async generateFortune(mood: string): Promise<any> {
    try {
      // 调用 AI 签文生成 Capability
      const result = await callCapabilities({ mood });
      
      if (result.code === 0 && result.data?.output?.response) {
        const aiResponse = result.data.output.response;
        
        // 解析 AI 返回的签文内容
        const parsedFortune = this.parseFortuneResponse(aiResponse);
        
        return {
          success: true,
          ...parsedFortune,
          rawResponse: aiResponse
        };
      } else {
        // 如果 AI 调用失败，返回默认签文
        return this.getDefaultFortune(mood);
      }
    } catch (error) {
      // 如果出现异常，返回默认签文
      return this.getDefaultFortune(mood);
    }
  }

  private parseFortuneResponse(response: string): any {
    // 解析 AI 返回的签文内容，参照图片格式精简输出
    const lines = response.split('\n').filter(line => line.trim());
    
    // 尝试提取签号 - 改进匹配逻辑
    let number = '上上签'; // 默认改为上上签，避免固定显示甲子
    let fortune = '上上签'; // 默认运势等级
    
    // 多种匹配模式
    const numberMatch = response.match(/【签号】\s*([^\n【]+)/) || 
                       response.match(/签号 [:：]\s*([^\n【]+)/) ||
                       response.match(/(第 [^ 签]+签)/) ||
                       response.match(/([上下中]+[上下吉凶平]+签)/);
    
    if (numberMatch && numberMatch[1]) {
      const matchedText = numberMatch[1].trim();
      // 如果匹配到的是运势等级（上上签等）
      if (matchedText.includes('上上') || matchedText.includes('上吉') || matchedText.includes('中吉') || matchedText.includes('中平') || matchedText.includes('下')) {
        fortune = matchedText;
      } else {
        // 如果是天干地支格式
        number = matchedText;
      }
    }

    // 尝试提取主签文（四句七言诗）
    let mainText = '忧思如茧缚灵台，云锁重楼月不开。阴 极阳生终有定，东风吹散雾中埃。';
    const mainTextMatch = response.match(/【主签文】\s*([^【]+)/) || 
                         response.match(/主签文 [:：]\s*([^\n【]+)/) ||
                         response.match(/([^.]+。[^.]+。[^.]+。[^.]+。)/);
    if (mainTextMatch && mainTextMatch[1]) {
      mainText = mainTextMatch[1].trim();
    }

    // 尝试提取白话解（简短解释）
    let culturalReference = '白话解：困顿至极必转通达，先历艰难而后得吉祥。';
    const referenceMatch = response.match(/【白话解】\s*([^【]+)/) || 
                          response.match(/白话解 [:：]\s*([^\n【]+)/) ||
                          response.match(/白话解 [：:]\s*([^\n]+)/);
    if (referenceMatch && referenceMatch[1]) {
      culturalReference = `白话解：${referenceMatch[1].trim()}`;
    }

    // 尝试提取卦象
    let hexagram = '否卦（䷋）';
    const hexagramMatch = response.match(/【卦象】\s*([^\n【]+)/) || 
                         response.match(/卦象 [:：]\s*([^\n【]+)/) ||
                         response.match(/([^卦]+卦 [^\n]+)/);
    if (hexagramMatch && hexagramMatch[1]) {
      hexagram = hexagramMatch[1].trim();
    }

    return {
      fortune,
      number,
      mainText,
      culturalReference,
      hexagram
    };
  }

  private getDefaultFortune(mood: string): any {
    // 基于用户心境返回不同的默认签文（精简格式）
    const defaultFortunes = [
      {
        fortune: '上上签',
        number: '甲子签',
        mainText: '花开富贵满庭芳，心想事成喜洋洋。贵人相助前程锦，事业通达福运长。',
        culturalReference: '白话解：万事顺遂，贵人扶持，前程似锦。',
        hexagram: '乾卦䷀'
      },
      {
        fortune: '中吉签',
        number: '乙丑签',
        mainText: '静待时机莫急躁，厚积薄发在今朝。守得云开见月明，春风得意马蹄骄。',
        culturalReference: '白话解：耐心等待，时机成熟自会成功。',
        hexagram: '坤卦䷁'
      },
      {
        fortune: '上吉签',
        number: '丙寅签',
        mainText: '福星高照喜临门，喜气盈门万事兴。机缘巧合天注定，收获满满福运生。',
        culturalReference: '白话解：福气满满，喜事连连，万事亨通。',
        hexagram: '泰卦䷊'
      },
      {
        fortune: '中平签',
        number: '丁卯签',
        mainText: '平淡是真守成福，静心修身待时来。莫道前路多坎坷，自有贵人助君行。',
        culturalReference: '白话解：平平淡淡才是真，守成待时自有福。',
        hexagram: '艮卦䷳'
      },
      {
        fortune: '下签',
        number: '戊辰签',
        mainText: '否极泰来终有时，转机将至莫迟疑。耐心等待云开日，终见曙光万事兴。',
        culturalReference: '白话解：困境即将过去，转机就在前方。',
        hexagram: '否卦䷋'
      }
    ];

    // 基于用户心境选择签文
    const hash = this.hashString(mood);
    const index = hash % defaultFortunes.length;
    
    return {
      success: false, // 标记为默认签文
      ...defaultFortunes[index],
      message: 'AI 签文生成服务暂时不可用，使用默认签文'
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
