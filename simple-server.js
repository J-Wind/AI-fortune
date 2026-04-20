const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist/client')));

// 签文生成 API
app.post('/api/fortune/generate-text', async (req, res) => {
  try {
    const { userMood } = req.body;
    const apiKey = process.env.AI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'API 密钥未配置' 
      });
    }
    
    const systemPrompt = '你是一位精通易经与东方古典文化的隐世占卜师。';
    const userPrompt = `请根据以下用户心境：${userMood}，生成一段神秘东方风格的签文，要求：
1. 签号：用天干地支格式给出，如"甲子"。
2. 主签文：四句七言古诗，蕴含哲理。
3. 文化引用：引用一句易经卦辞或诗经原文，并给出白话解释。
4. 卦象：给出对应的易经卦名、卦象符号（如☰☰）及其含义。
整体语言保持古雅神秘，不超过200字。`;
    
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: "qwen-plus",
        input: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        },
        parameters: {
          temperature: 0.5,
          max_tokens: 1024,
          result_format: "message"
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    
    let content = '';
    if (response.data.output.choices && response.data.output.choices.length > 0) {
      content = response.data.output.choices[0].message.content;
    } else if (response.data.output.text) {
      content = response.data.output.text;
    }
    
    // 解析签文内容
    const numberMatch = content.match(/【签号】\s*([^\n【]+)/) || 
                       content.match(/签号[:：]\s*([^\n【]+)/) ||
                       content.match(/(第[^签]+签)/) ||
                       content.match(/([上下中]+[上下吉凶平]+签)/);
    
    const mainTextMatch = content.match(/【主签文】\s*([^【]+)/) || 
                         content.match(/主签文[:：]\s*([^\n【]+)/) ||
                         content.match(/([^。]+。[^。]+。[^。]+。[^。]+。)/);
    
    const referenceMatch = content.match(/【文化引用】\s*([^【]+)/) || 
                          content.match(/文化引用[:：]\s*([^\n【]+)/) ||
                          content.match(/(《[^》]+》[^\n]+)/);
    
    const hexagramMatch = content.match(/【卦象】\s*([^\n【]+)/) || 
                         content.match(/卦象[:：]\s*([^\n【]+)/) ||
                         content.match(/([^卦]+卦[^\n]+)/);
    
    res.json({
      success: true,
      number: numberMatch ? numberMatch[1].trim() : '上上签',
      mainText: mainTextMatch ? mainTextMatch[1].trim() : '花开富贵，心想事成。',
      culturalReference: referenceMatch ? referenceMatch[1].trim() : '《易经》有云："天行健，君子以自强不息。"',
      hexagram: hexagramMatch ? hexagramMatch[1].trim() : '乾卦 - 天行健，君子以自强不息',
      rawResponse: content
    });
  } catch (error) {
    console.error('签文生成错误:', error.message);
    res.status(500).json({ 
      success: false, 
      message: '签文生成失败: ' + error.message 
    });
  }
});

// 解签 API
app.post('/api/fortune/generate-interpretation', async (req, res) => {
  try {
    const { fortuneText } = req.body;
    const apiKey = process.env.AI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'API 密钥未配置' 
      });
    }
    
    const systemPrompt = '你是一位精通易经与东方古典文化的隐世占卜师，擅长深度解签。';
    const userPrompt = `请根据以下签文内容进行深度解读：

${fortuneText}

请从以下四个方面进行解读：
1. 时节呼应：当前时节与签文的呼应关系
2. 卦象智慧：易经卦象蕴含的深刻智慧
3. 具体指引：针对当前情况的具体建议
4. 行动建议：可执行的行动指南

每个部分请详细阐述，语言保持古雅神秘。`;
    
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: "qwen-plus",
        input: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 2048,
          result_format: "message"
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    
    let content = '';
    if (response.data.output.choices && response.data.output.choices.length > 0) {
      content = response.data.output.choices[0].message.content;
    } else if (response.data.output.text) {
      content = response.data.output.text;
    }
    
    // 解析解签内容
    const lines = content.split('\n').filter(line => line.trim());
    
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
            seasonEcho += '\n' + line;
        }
      }
    }
    
    res.json({
      success: true,
      seasonEcho: seasonEcho.trim() || '当前时节与签文相呼应，反映了您内心的季节感受和情感波动。',
      hexagramWisdom: hexagramWisdom.trim() || '易经卦象蕴含着深刻的智慧，指导您在当前情境下的思考方向。',
      specificGuide: specificGuide.trim() || '针对您当前的具体情况，建议您在以下方面多加关注和调整。',
      actionAdvice: actionAdvice.trim() || '请根据签文含义自行判断行动方向，保持积极心态。',
      message: '解读生成成功'
    });
  } catch (error) {
    console.error('解签生成错误:', error.message);
    res.status(500).json({ 
      success: false, 
      message: '解签生成失败: ' + error.message 
    });
  }
});

// 图片生成 API（暂时返回占位符）
app.post('/api/fortune/generate-image', (req, res) => {
  res.json({
    success: true,
    imageUrl: 'https://picsum.photos/800/600',
    message: '图片生成成功'
  });
});

// 静态文件服务
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/client', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
