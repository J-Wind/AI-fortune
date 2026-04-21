import axios from 'axios';
import { Logger } from '@nestjs/common';


const logger = new Logger('ai_text_generate_oracle');

interface InputParams {
  /** 用户当前心境或想法 */
  mood: string;
}

interface Output {
  /** 正文文本 */
  response: string;
}


interface FailureOutput {
  response: {
    status: {
      /** 协议层返回码（如 HTTP 状态码） */
      protocolStatusCode: string;
      /** 业务应用状态码 */
      appStatusCode: string;
    };
    /** 返回体（JSON 字符串形式） */
    body: string;
  };
}

interface Response {
  code: number;
  data?: {
    output?: Output;
    outcome?: string;
    failureOutput?: FailureOutput;
  };
  message?: string;
}

// 阿里千问 DashScope API 响应结构
interface QianwenResponse {
  output: {
    text?: string;
    choices?: Array<{
      message: {
        content: string;
        role: string;
      };
      finish_reason: string;
    }>;
  };
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  request_id: string;
}

// Capability AI神秘东方签文生成, 功能是: 根据用户输入的心境、想法生成神秘东方风格签文，含签号、主签文、文化引用与卦象
// 当Capability被成功执行时，Response.data.output的结构如下（JSON Schema格式）：
/**
 * {"type":"object","properties":{"response":{"type":"string","description":"正文文本"}}}
 */
export const callCapabilities = async (input: InputParams): Promise<Response> => {
  try {
    const apiKey = process.env['AI_API_KEY'] || '';
    
    if (!apiKey) {
      logger.error('阿里千问 API 密钥未配置');
      return {
        code: 1,
        message: '阿里千问 API 密钥未配置',
      };
    }
    
    const systemPrompt = '你是一位精通易经与东方古典文化的隐世占卜师。';
    const userPrompt = `请根据以下用户心境：${input.mood}，生成一段神秘东方风格的签文，严格按照以下格式：

【签号】天干地支格式（如：甲子签）
【主签文】四句七言古诗，每句 7 个字，共 28 字，蕴含哲理
【白话解】用一句话简短解释签文含义（20 字以内）
【卦象】易经卦名 + 卦象符号（如：否卦䷋）

示例格式：
【签号】乙亥签
【主签文】忧思如茧缚灵台，云锁重楼月不开。阴极阳生终有定，东风吹散雾中埃。
【白话解】困顿至极必转通达，先历艰难而后得吉祥。
【卦象】否卦䷋

要求：
- 签文要根据用户输入的心境量身定制
- 主签文必须是四句七言诗格式
- 白话解要简洁明了，一句话说完
- 整体保持古雅神秘感
- 总字数控制在 100 字以内`;
    
    const requestData = {
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
    };

    logger.log('千问 API 请求数据: ' + JSON.stringify(requestData));
    logger.log('请求URL: https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation');
    
    const header = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    
    const response = await axios.post<QianwenResponse>(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      requestData,
      {
        headers: header,
        timeout: 60000,
      },
    );
    
    logger.log(`千问 API 响应状态: ${response.status}`);
    logger.log('千问 API 响应数据: ' + JSON.stringify(response.data));
    
    let content = '';
    if (response.data.output.choices && response.data.output.choices.length > 0) {
      content = response.data.output.choices[0].message.content;
    } else if (response.data.output.text) {
      content = response.data.output.text;
    }
    
    if (content) {
      return {
        code: 0,
        data: {
          output: {
            response: content
          },
          outcome: 'success'
        }
      };
    } else {
      return {
        code: 1,
        message: '千问 API 未返回有效数据',
      };
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      logger.error(`Axios错误类型: ${error.code || 'UNKNOWN'}`);
      logger.error(`错误消息: ${error.message}`);

      if (error.response) {
        logger.error(`HTTP状态码: ${error.response.status}`);
        logger.error(`HTTP状态文本: ${error.response.statusText}`);
        logger.error(`响应数据: ${JSON.stringify(error.response.data)}`);
        logger.error(`响应头: ${JSON.stringify(error.response.headers)}`);
      } else if (error.request) {
        logger.error('请求已发送但未收到响应');
        logger.error(
          `请求配置: ${JSON.stringify({
            url: error.config?.url,
            method: error.config?.method,
            timeout: error.config?.timeout,
            headers: error.config?.headers
              ? Object.keys(error.config.headers)
              : '无',
          })}`,
        );
      } else {
        logger.error('请求配置错误');
        logger.error(`错误消息: ${error.message}`);
      }

      if (error.code === 'ECONNREFUSED') {
        logger.error('连接被拒绝，请检查目标服务是否运行');
      } else if (error.code === 'ETIMEDOUT') {
        logger.error('请求超时，请检查网络连接或增加超时时间');
      } else if (error.code === 'ENOTFOUND') {
        logger.error('域名解析失败，请检查域名是否正确');
      } else if (
        error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
        error.code === 'CERT_HAS_EXPIRED'
      ) {
        logger.error('SSL证书验证失败，请检查证书配置');
      }
    } else if (error instanceof Error) {
      logger.error(`错误名称: ${error.name}`);
      logger.error(`错误消息: ${error.message}`);
      logger.error(`错误堆栈: ${error.stack}`);
    } else {
      logger.error(`未知错误类型: ${typeof error}`);
      logger.error(`错误内容: ${String(error)}`);
    }
    return {
      code: 1,
      message: error instanceof Error ? error.message : '未知错误',
    };
  }
};
