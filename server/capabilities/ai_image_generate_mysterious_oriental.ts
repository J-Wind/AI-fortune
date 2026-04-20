import axios from 'axios';
import { Logger } from '@nestjs/common';

const logger = new Logger('ai_image_generate_mysterious_oriental');

interface InputParams {
  /** 签文内容 */
  fortune_text: string;
  /** 图片比例，可选值：16:9、3:2、4:3、1:1、2:3、9:16，默认1:1 */
  image_ratio?: string;
}

interface Output {
  /** 图片URL列表 */
  images: string[];
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

// Capability AI生成神秘东方风格图片, 功能是: 根据签文内容生成配套的神秘东方风格图片，支持多种图片比例
// 当Capability被成功执行时，Response.data.output的结构如下（JSON Schema格式）：
/**
 * {"type":"object","properties":{"images":{"description":"图片URL列表","type":"array","items":{"type":"string","description":"图片URL"}}}}
 */
export const callCapabilities = async (input: InputParams): Promise<Response> => {
  try {
    // 从环境变量中获取接口鉴权Token
    const token = process.env['INTEGRATION_TOKEN'] || '';
    const envKey = '';
    const actionInput =     {
          "prompt": "{{input.fortune_text}}, 神秘东方风格，古风，唯美，意境深远，水墨画风格，柔和色调，高清，禁止在图片里增加文字",
          "image_ratio": "{{input.image_ratio}}",
          "watermark": false
    };
    const requestData = {
      capability: {
        sourceActionID: 'official_ai/image_generate',
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