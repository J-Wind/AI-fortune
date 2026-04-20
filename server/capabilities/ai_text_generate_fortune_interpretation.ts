import axios from 'axios';
import { Logger } from '@nestjs/common';


const logger = new Logger('ai_text_generate_fortune_interpretation');

interface InputParams {
  /** 签文内容 */
  fortune_text: string;
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

// Capability AI深度解签, 功能是: 根据签文内容生成白话解读、行动建议、宜忌提示等完整解签文本
// 当Capability被成功执行时，Response.data.output的结构如下（JSON Schema格式）：
/**
 * {"type":"object","properties":{"response":{"type":"string","description":"正文文本"}}}
 */
export const callCapabilities = async (input: InputParams): Promise<Response> => {
  try {
    // 从环境变量中获取接口鉴权Token
    const token = process.env['INTEGRATION_TOKEN'] || '';
    const envKey = '';
    const actionInput =     {
          "prompt": "请对以下签文进行深度解读，严格按照以下四个模块格式输出：\n\n1. 时节呼应：分析当前时节与签文的关联，反映用户内心的季节感受和情感波动；\n2. 卦象智慧：解读易经卦象的深层含义和智慧启示；\n3. 具体指引：针对用户当前具体情况，给出具体的关注和调整方向；\n4. 行动建议：提供具体的行动建议和心态调整方向。\n\n每个模块用清晰的标题标识，内容要个性化、有深度。\n\n签文内容：{{input.fortune_text}}",
          "model_id": "87",
          "temperature": "0.7",
          "max_tokens": "1500"
    };
    const requestData = {
      capability: {
        sourceActionID: 'official_ai/text_generate',
        actionInput: JSON.stringify(actionInput),
      },
      input: JSON.stringify(input),
    };

    logger.log('接口请求数据: ' + JSON.stringify(requestData));
    logger.log('请求URL: https://miaoda.feishu.cn/play/api/feida/v1/integration/capabilities/call');
    
    const header = {
      Authorization: `Bearer ${token}`,
      'X-API-Key': `${token}`,
      'Content-Type': 'application/json',
    }
    if (envKey.length > 0) {
      header['x-tt-env'] = envKey;
    }
    const response = await axios.post(
      'https://miaoda.feishu.cn/play/api/feida/v1/integration/capabilities/call',
      requestData,
      {
        headers: header,
      },
    );
    
    logger.log(`接口响应状态: ${response.status}`);
    logger.log('接口响应数据: ' + JSON.stringify(response.data));
    logger.log('接口响应头: ' + JSON.stringify(response.headers));

    return response.data as Response;
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