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
    const { userMood, userThought, seasonFeel } = req.body;
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
    
    const systemPrompt = `你是一位精通易经与东方古典文化的隐世占卜师。请严格按照格式输出完整的签文。

【核心原则 - 必须严格遵守】
1. 每次必须根据用户输入的具体内容（心中所念、心境、时节）生成完全不同的个性化签文
2. 绝对禁止使用固定的模板或重复内容
3. 绝对禁止生成"花开富贵"、"心想事成"等通用套话
4. 主签文的每一句都必须与用户输入的问题或心境相关
5. 如果用户提到具体事项（工作/感情/学业/健康），签文必须围绕该事项展开
6. 不同的用户输入必须产生不同的签文内容`;

    const userPrompt = `【用户信息】
- 心中所念：${userThought || '未填写'}
- 当前心境：${userMood || '平静'}
- 时节感受：${seasonFeel || '未填写'}

【个性化要求 - 必须执行】
1. 分析用户"心中所念"的核心诉求（事业/感情/学业/健康/其他）
2. 根据用户"当前心境"调整签文的情感基调（焦虑→安抚，期待→鼓励）
3. 将"时节感受"融入签文的自然意象描写中
4. 主签文四句诗必须直接回应或暗示用户的所思所想

【示例对照】

示例1 - 用户问工作：
主签文应为："云开雾散见青天，鹏程万里正扬帆。莫道征途多险阻，功名指日上云端。"
（体现：事业发展、克服困难、成功在望）

示例2 - 用户问感情：
主签文应为："月下花前遇良缘，红线暗牵两心连。莫愁前路无知己，此去花开并蒂莲。"
（体现：姻缘将至、缘分天定、爱情美满）

示例3 - 用户问考试：
主签文应为："寒窗苦读志如钢，笔走龙蛇意气扬。金榜题名终有日，春风得意马蹄香。"
（体现：学业有成、考试顺利、功成名就）

必须包含以下5个部分：

【吉凶】从以下选择一个：上上签、上吉签、中吉签、中平签、下下签
（根据用户的心境和所念事情来判断吉凶）

【签号】天干地支格式，如"庚辰签"

【主签文】四句七言古诗，每句7字，押韵，内容必须与用户输入高度相关

【易经引】引用《易经》原文卦辞+白话解，卦象要与用户情况相关

【卦象】卦名+卦象符号，如：乾卦 ☰☰

【输出格式检查清单】
□ 主签文是否提到了与用户问题相关的意象？
□ 文化引用是否与用户处境呼应？
□ 吉凶判断是否基于用户实际情况？
□ 整体内容是否针对该用户独一无二？`;
    
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
    
    // 根据签文内容构建场景描述
    let mainElements = [];
    let atmosphere = '';
    let timeOfDay = '';
    let characterElement = null;

    // 检查是否需要添加人物（只有签文暗示有人物活动时才添加）
    const needsCharacter = fortuneText.includes('人') || 
                          fortuneText.includes('君') || 
                          fortuneText.includes('吾') ||
                          fortuneText.includes('君') ||
                          fortuneText.includes('你') ||
                          fortuneText.includes('我') ||
                          fortuneText.includes('行') ||
                          fortuneText.includes('立') ||
                          fortuneText.includes('坐') ||
                          fortuneText.includes('望') ||
                          fortuneText.includes('观') ||
                          fortuneText.includes('思') ||
                          fortuneText.includes('待') ||
                          fortuneText.includes('候');

    // 提取主要视觉元素
    if (fortuneText.includes('月') || fortuneText.includes('明月')) {
      mainElements.push('一轮皎洁的圆月高悬夜空，月光如水洒落');
      timeOfDay = '夜晚';
      if (needsCharacter) characterElement = '一位古代文人仰望明月，若有所思';
    }
    if (fortuneText.includes('云') || fortuneText.includes('云开')) {
      mainElements.push('浓密的乌云翻滚，云层间透出微光，云雾缭绕');
      if (needsCharacter && !characterElement) characterElement = '人物立于云雾之间';
    }
    if (fortuneText.includes('花') || fortuneText.includes('花开')) {
      mainElements.push('盛开的梅花或桃花，花瓣飘落');
      atmosphere = '春意盎然';
      if (needsCharacter && !characterElement) characterElement = '人物赏花沉思';
    }
    if (fortuneText.includes('水') || fortuneText.includes('溪') || fortuneText.includes('江')) {
      mainElements.push('静谧的湖面或潺潺溪流，水波不兴');
      if (needsCharacter && !characterElement) characterElement = '人物临水而立，俯瞰水面倒影';
    }
    if (fortuneText.includes('山') || fortuneText.includes('峰')) {
      mainElements.push('远山如黛，层峦叠嶂，山势连绵');
      if (needsCharacter && !characterElement) characterElement = '人物远眺群山';
    }
    if (fortuneText.includes('松')) {
      mainElements.push('苍劲的古松，枝干虬曲');
      if (needsCharacter && !characterElement) characterElement = '人物倚松而立';
    }
    if (fortuneText.includes('鹤') || fortuneText.includes('鸟')) {
      mainElements.push('飞翔的仙鹤或飞鸟，展翅翱翔');
      if (needsCharacter && !characterElement) characterElement = '人物仰观飞鸟';
    }
    if (fortuneText.includes('舟') || fortuneText.includes('船')) {
      mainElements.push('一叶扁舟漂浮于水面');
      if (needsCharacter && !characterElement) characterElement = '人物独立船头';
    }
    if (fortuneText.includes('亭') || fortuneText.includes('楼')) {
      mainElements.push('古朴的亭台楼阁，飞檐翘角，隐于云雾中');
      if (needsCharacter && !characterElement) characterElement = '人物伫立楼阁前';
    }
    if (fortuneText.includes('竹')) {
      mainElements.push('翠绿的竹林，竹影婆娑');
      if (needsCharacter && !characterElement) characterElement = '人物穿行竹林间';
    }
    if (fortuneText.includes('雪') || fortuneText.includes('冬')) {
      mainElements.push('皑皑白雪覆盖大地，雪花飘落');
      atmosphere = '冬日清寂';
      timeOfDay = '冬日';
      if (needsCharacter && !characterElement) characterElement = '人物踏雪而行';
    }
    if (fortuneText.includes('雨')) {
      mainElements.push('细雨蒙蒙，雨丝如织');
      if (needsCharacter && !characterElement) characterElement = '人物撑伞或冒雨前行';
    }
    if (fortuneText.includes('风')) {
      mainElements.push('微风吹拂，衣袂飘飘');
      if (needsCharacter && !characterElement) characterElement = '人物迎风而立';
    }
    if (fortuneText.includes('日') || fortuneText.includes('阳') || fortuneText.includes('曙')) {
      mainElements.push('初升的朝阳或夕阳余晖，霞光万道');
      timeOfDay = '清晨或黄昏';
      if (needsCharacter && !characterElement) characterElement = '人物面向阳光';
    }
    if (fortuneText.includes('星')) {
      mainElements.push('璀璨星空，繁星点点');
      timeOfDay = '深夜';
      if (needsCharacter && !characterElement) characterElement = '人物仰望星空';
    }
    if (fortuneText.includes('桥')) {
      mainElements.push('古老的石桥横跨水面');
      if (needsCharacter && !characterElement) characterElement = '人物立于桥头';
    }
    if (fortuneText.includes('路') || fortuneText.includes('径') || fortuneText.includes('道')) {
      mainElements.push('蜿蜒的小径通向远方');
      if (needsCharacter && !characterElement) characterElement = '人物漫步小径上';
    }

    // 如果没有匹配到特定元素，使用默认场景
    if (mainElements.length === 0) {
      mainElements = ['远山近水', '几株古树', '飘落的落叶', '淡淡的云雾'];
      atmosphere = '宁静致远';
      timeOfDay = '黄昏时分';
      if (needsCharacter) characterElement = '人物静坐沉思，神态安详';
    }

    // 构建提示词
    let imagePrompt = '';
    
    if (characterElement) {
      // 有人物版本的提示词
      imagePrompt = `创作一幅精美的中国传统水墨画插画，风格类似宋代工笔与写意结合。

【核心构图】
画面主体：${characterElement}（身着宽袍大袖的汉服，发髻高束，气质儒雅）
人物位置：画面前景偏一侧，约占画面1/3，侧身或半侧面，营造意境感

【场景元素】
${mainElements.map((el, i) => `${i + 1}. ${el}`).join('\n')}

【时间氛围】
时间设定：${timeOfDay}
整体氛围：${atmosphere || '神秘悠远'}

【艺术风格要求】
- 采用中国传统水墨画技法，笔墨酣畅淋漓
- 人物刻画精细，线条流畅，面部表情传神
- 背景采用写意手法，虚实结合，大量留白
- 构图讲究：近景（人物）、中景（景物）、远景（山水）层次分明
- 色彩以水墨黑白灰为主调，适当点缀淡青、赭石等传统色
- 光影处理：月光/日光从特定角度洒下，营造戏剧性光影效果
- 整体格调高雅脱俗，富有诗意和禅意`;
    } else {
      // 纯风景版本的提示词
      imagePrompt = `创作一幅精美的中国传统水墨风景画，风格类似宋代山水画。

【画面主体】
纯风景构图，无人物出现

【场景元素】
${mainElements.map((el, i) => `${i + 1}. ${el}`).join('\n')}

【时间氛围】
时间设定：${timeOfDay}
整体氛围：${atmosphere || '宁静悠远'}

【艺术风格要求】
- 采用中国传统水墨画技法，笔墨酣畅淋漓
- 采用写意手法，虚实结合，大量留白
- 构图讲究：近景、中景、远景层次分明
- 色彩以水墨黑白灰为主调，适当点缀淡青、赭石等传统色
- 光影处理：月光/日光从特定角度洒下，营造戏剧性光影效果
- 整体格调高雅脱俗，富有诗意和禅意
- 强调自然景观的空灵与意境`;
    }

    // 添加禁止项
    imagePrompt += `

【绝对禁止】
- 图片中不允许出现任何文字、汉字、字母、符号
- 不允许出现印章、题字、落款
- 不允许出现现代元素
- 只呈现纯绘画艺术作品`;

    const negativePrompt = `文字, 字母, 汉字, 印章, 题字, 落款, 签名, watermark, text, writing, calligraphy on image, modern elements, photograph, realistic photo`;
    
    // 第一步：提交图片生成任务
    const submitResponse = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation',
      {
        model: "wan2.7-image-pro",
        input: {
          messages: [
            {
              role: "user",
              content: [
                {
                  text: imagePrompt
                }
              ]
            }
          ]
        },
        parameters: {
          size: "1344*768",
          n: 1,
          negative_prompt: negativePrompt
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
        // wan2.7-image-pro 的返回格式
        imageUrl = statusResponse.data.output?.choices?.[0]?.message?.content?.[0]?.image || '';
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
