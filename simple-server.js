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
    const apiKey = process.env.AI_API_KEY || 'sk-368063b63be646edac7d2fa4bceb069a';
    
    console.log('AI_API_KEY exists:', !!apiKey);
    console.log('AI_API_KEY length:', apiKey ? apiKey.length : 0);
    console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('AI') || k.includes('KEY')).join(', '));
    
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'API 密钥未配置' 
      });
    }
    
    const systemPrompt = '你是一位精通易经与东方古典文化的隐世占卜师。请严格按照格式输出完整的签文，内容要精简有力。';
    const userPrompt = `请根据以下用户心境：${userMood}，生成一段神秘东方风格的完整签文。

必须包含以下4个部分：

【吉凶】从以下选择一个：上上签、上吉签、中吉签、中平签、下下签

【签号】天干地支格式，如"庚辰签"

【主签文】四句七言古诗，每句7字，押韵，如：
云开月朗照庭除，静待东风第一枝。
莫叹征途多阻滞，冰心一片化春溪。

【易经引】引用《易经》原文卦辞+白话解，如：
《易经·乾卦》曰："初九：潜龙勿用。"白话解：龙潜伏水中，时机未到暂不施展，需养精蓄锐。

【卦象】卦名+卦象符号，如：
乾卦 ☰☰

输出要求：
- 严格按照【吉凶】【签号】【主签文】【易经引】【卦象】五个标签格式
- 内容精简，不要冗长解释
- 语言古雅神秘，有文化底蕴`;
    
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
    const fortuneMatch = content.match(/【吉凶】\s*([^\n【]+)/) || 
                        content.match(/吉凶[:：]\s*([^\n【]+)/) ||
                        content.match(/([上下中]+[上下吉凶平]+签)/);
    
    const numberMatch = content.match(/【签号】\s*([^\n【]+)/) || 
                       content.match(/签号[:：]\s*([^\n【]+)/) ||
                       content.match(/(第[^签]+签)/);
    
    const mainTextMatch = content.match(/【主签文】\s*([^【]+)/) || 
                         content.match(/主签文[:：]\s*([^\n【]+)/) ||
                         content.match(/([^。]+。[^。]+。[^。]+。[^。]+。)/);
    
    const referenceMatch = content.match(/【易经引】\s*([^【]+)/) || 
                          content.match(/【文化引用】\s*([^【]+)/) ||
                          content.match(/(《[^》]+》[^\n]+)/);
    
    const hexagramMatch = content.match(/【卦象】\s*([^\n【]+)/) || 
                         content.match(/卦象[:：]\s*([^\n【]+)/) ||
                         content.match(/([^卦]+卦[^\n]+)/);
    
    res.json({
      success: true,
      fortune: fortuneMatch ? fortuneMatch[1].trim() : '上上签',
      number: numberMatch ? numberMatch[1].trim() : '庚辰签',
      mainText: mainTextMatch ? mainTextMatch[1].trim() : '花开富贵，心想事成。',
      culturalReference: referenceMatch ? referenceMatch[1].trim() : '《易经》有云："天行健，君子以自强不息。"',
      hexagram: hexagramMatch ? hexagramMatch[1].trim() : '乾卦 ☰☰',
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
    const apiKey = process.env.AI_API_KEY || 'sk-368063b63be646edac7d2fa4bceb069a';
    
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'API 密钥未配置' 
      });
    }
    
    const systemPrompt = '你是一位经验丰富的老先生，说话实在、接地气，擅长用大白话给老百姓解签。不要用任何markdown格式符号（如*、#、-等），就用纯文字，像跟朋友聊天一样说。';
    const userPrompt = `请根据以下签文内容，用大白话给我深度解读：

${fortuneText}

请严格按照以下四个部分详细解读，每部分都要有实质性的具体内容，不要空泛：

时节呼应
说说现在的天气季节（初夏/盛夏/秋季等）跟这个签有什么关系，为什么这个时候抽到这个签特别有意义

卦象智慧
用简单的大白话解释这个卦象是什么意思，它告诉我们要懂得什么道理，蕴含什么人生智慧

具体指引
针对这个人现在遇到的困惑或事情：
1. 核心要点：这件事最关键的是什么
2. 需要注意什么：有哪些坑要避开
3. 心态调整：该用什么心态面对

行动建议
给出5条能马上照做的具体建议，每条建议都要像这样写：
心态调整：把期待转化为准备，以潜龙姿态保持谦逊而自信的心态，相信自己的积累终会在适当时机展现
面试策略：如云开月出般从容自然，给面试官留下良好第一印象
问答环节：如静待东风般不急不躁，听清问题再作答
面对难题：如莫叹花未发般坦然承认不足，同时展示学习能力和成长潜力
后续行动：无论面试结果如何，都视为一次宝贵的经验积累

记住：
1. 说话要像老街坊聊天一样自然实在
2. 每个建议都要具体可执行，不要空话套话
3. 结合签文的具体意象来解读
4. 让人看完就知道该怎么干
5. 不要用任何特殊符号
6. 标题直接写"时节呼应"、"卦象智慧"等，不要加"第一部分"、"第二部分"等前缀`;
    
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
          temperature: 0.8,
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

// 图片生成 API - 中国水墨风
app.post('/api/fortune/generate-image', async (req, res) => {
  try {
    const { fortuneText } = req.body;
    const apiKey = process.env.AI_API_KEY || 'sk-368063b63be646edac7d2fa4bceb069a';
    
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'API 密钥未配置' 
      });
    }
    
    // 根据签文内容反推关键词生成图片提示词
    let sceneKeywords = '';
    
    // 根据签文内容提取场景关键词
    if (fortuneText.includes('云') || fortuneText.includes('天')) {
      sceneKeywords += '云雾缭绕的天空、';
    }
    if (fortuneText.includes('月') || fortuneText.includes('夜')) {
      sceneKeywords += '皎洁的明月、';
    }
    if (fortuneText.includes('风')) {
      sceneKeywords += '飞舞的燕子或仙鹤、';
    }
    if (fortuneText.includes('花') || fortuneText.includes('春')) {
      sceneKeywords += '盛开的梅花或桃花、';
    }
    if (fortuneText.includes('水') || fortuneText.includes('龙') || fortuneText.includes('潜')) {
      sceneKeywords += '静谧的湖面或溪流、';
    }
    if (fortuneText.includes('山') || fortuneText.includes('峰')) {
      sceneKeywords += '远山如黛、';
    }
    if (fortuneText.includes('庭') || fortuneText.includes('阶')) {
      sceneKeywords += '古朴的石阶或庭院、';
    }
    if (fortuneText.includes('松') || fortuneText.includes('鹤')) {
      sceneKeywords += '古松、仙鹤、';
    }
    if (fortuneText.includes('雾') || fortuneText.includes('冥')) {
      sceneKeywords += '晨雾缭绕、';
    }
    if (fortuneText.includes('苔') || fortuneText.includes('径')) {
      sceneKeywords += '青苔石径、';
    }
    
    // 默认元素
    const defaultElements = '枝头绿叶、飘落的花瓣';
    
    const imagePrompt = `中国传统水墨画风格，意境深远，古风韵味。
画面主体：${sceneKeywords}${defaultElements}
艺术风格：淡雅水墨色调，大量留白，像宋代文人画家的作品
氛围：宁静致远，神秘东方美学，有文化底蕴
构图：画面要有层次感，近景中景远景分明
色彩：以黑白灰为主，点缀淡淡的青绿色或赭石色`;
    
    // 第一步：提交图片生成任务
    const submitResponse = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation',
      {
        model: "wan2.7-image-pro",
        input: {
          prompt: imagePrompt
        },
        parameters: {
          size: "1024*1024",
          n: 1
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable'
        },
        timeout: 30000
      }
    );
    
    const taskId = submitResponse.data.output?.task_id;
    if (!taskId) {
      throw new Error('未获取到任务ID');
    }
    
    // 第二步：轮询任务状态
    let imageUrl = '';
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await axios.get(
        `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 10000
        }
      );
      
      const taskStatus = statusResponse.data.output?.task_status;
      
      if (taskStatus === 'SUCCEEDED') {
        imageUrl = statusResponse.data.output?.results?.[0]?.url || '';
        break;
      } else if (taskStatus === 'FAILED') {
        throw new Error('图片生成任务失败');
      }
      
      attempts++;
    }
    
    if (!imageUrl) {
      imageUrl = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=600&fit=crop';
    }
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      message: '图片生成成功'
    });
  } catch (error) {
    console.error('图片生成错误:', error.message);
    res.json({
      success: true,
      imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=600&fit=crop',
      message: '使用默认图片'
    });
  }
});

// 静态文件服务
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/client', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('AI_API_KEY configured:', !!process.env.AI_API_KEY);
  console.log('PORT:', process.env.PORT);
  console.log('SERVER_PORT:', process.env.SERVER_PORT);
});
