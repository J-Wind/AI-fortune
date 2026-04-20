import axios from 'axios';
import { Logger } from '@nestjs/common';


const logger = new Logger('feishu_send_fortune_result');

interface InputParams {
  /** 签文标题 */
  title: string;
  /** 签文内容 */
  content: string;
  /** 深度解读摘要 */
  summary: string;
  /** AI图片链接 */
  image_url: string;
  /** 当前用户ID */
  user_id: string;
}

interface Output {}


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

// Capability 发送解签结果飞书消息, 功能是: 将签文标题、签文内容、深度解读摘要和AI图片链接发送给当前用户本人
// 当Capability被成功执行时，Response.data.output的结构如下（JSON Schema格式）：
/**
 * {"type":"object"}
 */
export const callCapabilities = async (input: InputParams): Promise<Response> => {
  try {
    // 从环境变量中获取接口鉴权Token
    const token = process.env['INTEGRATION_TOKEN'] || '';
    const envKey = '';
    const actionInput =     {
          "receiver_user_list": [
                "{{input.user_id}}"
          ],
          "receiver_group_list": [],
          "card_content": "{\"body\":{\"direction\":\"vertical\",\"elements\":[{\"tag\":\"markdown\",\"content\":\"**{{input.title}}**\\n\\n{{input.content}}\",\"text_size\":\"normal\",\"margin\":\"0px 0px 0px 0px\",\"element_id\":\"custom_id\"},{\"element_id\":\"bottom_hr\",\"tag\":\"hr\",\"margin\":\"0px 0px 0px 0px\"},{\"margin\":\"0px 0px 0px 0px\",\"element_id\":\"bottom_tip\",\"tag\":\"markdown\",\"content\":\"来自飞书妙搭解签小助手\",\"text_align\":\"left\",\"text_size\":\"normal_v2\"}]},\"header\":{\"padding\":\"12px 8px 12px 8px\",\"title\":{\"tag\":\"plain_text\",\"content\":\"你的天机已送到\"},\"subtitle\":{\"tag\":\"plain_text\",\"content\":\"\"},\"template\":\"blue\"},\"schema\":\"2.0\",\"config\":{\"update_multi\":true}}",
          "creator_id": "test_user_id"
    };
    const requestData = {
      capability: {
        sourceActionID: 'official_feishu/send_message',
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