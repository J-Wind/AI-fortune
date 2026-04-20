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
    output?: Output; // 执行成功时的输出结果
    outcome?: string; // 执行结果，success或error
    failureOutput?: FailureOutput; // 执行失败时的输出结果
  };
  message?: string; // 发生系统错误时的错误信息
}

// 阿里千问 API 响应结构
interface QianwenResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Capability AI神秘东方签文生成, 功能是: 根据用户输入的心境、想法生成神秘东方风格签文，含签号、主签文、文化引用与卦象
// 当Capability被成功执行时，Response.data.output的结构如下（JSON Schema格式）：
/**
 * {"type":"object","properties":{"response":{"type":"string","description":"正文文本"}}}
 */
export const callCapabilities = async (input: InputParams): Promise<Response> => {
  try {
    // 从环境变量中获取阿里千问 API 密钥
    const apiKey = process.env['AI_API_KEY'] || '';
    
    if (!apiKey) {
      logger.error('阿里千问 API 密钥未配置');
      return {
        code: 1,
        message: '阿里千问 API 密钥未配置',
      };
    }
    
    // 构建千问 API 请求
    const prompt = `你是一位精通易经与东方古典文化的隐世占卜师。请根据以下用户心境：${input.mood}，生成一段神秘东方风格的签文，要求：\n1. 签号：用天干地支格式给出，如“甲子”。\n2. 主签文：四句七言古诗，蕴含哲理。\n3. 文化引用：引用一句易经卦辞或诗经原文，并给出白话解释。4. 卦象：给出对应的易经卦名、卦象符号（如☰☰）及其含义。整体语言保持古雅神秘，不超过200字。`;
    
    const requestData = {
      model: "qwen-plus", // 千问模型名称
      messages: [
        {
          role: "system",
          content: "你是一位精通易经与东方古典文化的隐世占卜师。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1024
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
      },
    );
    
    logger.log(`千问 API 响应状态: ${response.status}`);
    logger.log('千问 API 响应数据: ' + JSON.stringify(response.data));
    
    // 处理千问 API 响应
    if (response.data.choices && response.data.choices.length > 0) {
      const content = response.data.choices[0].message.content;
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
      // Axios错误 - 网络请求相关
      logger.error(`Axios错误类型: ${error.code || 'UNKNOWN'}`);
      logger.error(`错误消息: ${error.message}`);

      if (error.response) {
        // 服务器响应了，但状态码不是2xx
        logger.error(`HTTP状态码: ${error.response.status}`);
        logger.error(`HTTP状态文本: ${error.response.statusText}`);
        logger.error(`响应数据: ${JSON.stringify(error.response.data)}`);
        logger.error(`响应头: ${JSON.stringify(error.response.headers)}`);
      } else if (error.request) {
        // 请求已发送但无响应
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
        // 请求配置错误
        logger.error('请求配置错误');
        logger.error(`错误消息: ${error.message}`);
      }

      // 检查网络相关错误
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
      // 通用错误
      logger.error(`错误名称: ${error.name}`);
      logger.error(`错误消息: ${error.message}`);
      logger.error(`错误堆栈: ${error.stack}`);
    } else {
      // 未知错误类型
      logger.error(`未知错误类型: ${typeof error}`);
      logger.error(`错误内容: ${String(error)}`);
    }
    return {
      code: 1,
      message: error instanceof Error ? error.message : '未知错误',
    };
  }
};