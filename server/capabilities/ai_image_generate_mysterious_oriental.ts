import axios from 'axios';
import { Logger } from '@nestjs/common';

const logger = new Logger('ai_image_generate_mysterious_oriental');

interface InputParams {
  fortune_text: string;
  image_ratio?: string;
}

interface Output {
  images: string[];
}

interface FailureOutput {
  response: {
    status: {
      protocolStatusCode: string;
      appStatusCode: string;
    };
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

interface WanxImageResponse {
  output: {
    task_id: string;
    task_status: string;
    results?: Array<{
      url: string;
    }>;
  };
  usage: {
    image_count: number;
  };
  request_id: string;
}

interface WanxTaskResponse {
  output: {
    task_id: string;
    task_status: string;
    results?: Array<{
      url: string;
    }>;
  };
  request_id: string;
}

const ratioMap: Record<string, string> = {
  '16:9': '16:9',
  '3:2': '3:2',
  '4:3': '4:3',
  '1:1': '1:1',
  '2:3': '2:3',
  '9:16': '9:16',
};

export const callCapabilities = async (input: InputParams): Promise<Response> => {
  try {
    const apiKey = process.env['AI_API_KEY'] || '';
    
    if (!apiKey) {
      logger.error('千问 API 密钥未配置');
      return {
        code: 1,
        message: '千问 API 密钥未配置',
      };
    }
    
    const imageRatio = ratioMap[input.image_ratio || '1:1'] || '1:1';
    
    const prompt = `${input.fortune_text}, 神秘东方风格，古风，唯美，意境深远，水墨画风格，柔和色调，高清`;
    
    const requestData = {
      model: "wanx2.1-t2i-turbo",
      input: {
        prompt: prompt,
      },
      parameters: {
        size: imageRatio === '1:1' ? '1024*1024' : 
              imageRatio === '16:9' ? '1280*720' :
              imageRatio === '9:16' ? '720*1280' :
              imageRatio === '4:3' ? '1024*768' :
              imageRatio === '3:2' ? '1216*832' :
              imageRatio === '2:3' ? '832*1216' : '1024*1024',
        n: 1,
      }
    };

    logger.log('千问图片生成请求数据: ' + JSON.stringify(requestData));
    
    const header = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    };
    
    const submitResponse = await axios.post<WanxImageResponse>(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
      requestData,
      {
        headers: header,
        timeout: 30000,
      },
    );
    
    logger.log(`图片生成提交响应状态: ${submitResponse.status}`);
    logger.log('图片生成提交响应数据: ' + JSON.stringify(submitResponse.data));
    
    const taskId = submitResponse.data.output.task_id;
    
    if (!taskId) {
      return {
        code: 1,
        message: '图片生成任务提交失败',
      };
    }
    
    const taskHeader = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    
    let taskStatus = submitResponse.data.output.task_status;
    let maxRetries = 30;
    let retryCount = 0;
    
    while (taskStatus === 'PENDING' || taskStatus === 'RUNNING') {
      if (retryCount >= maxRetries) {
        return {
          code: 1,
          message: '图片生成超时',
        };
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      retryCount++;
      
      const taskResponse = await axios.get<WanxTaskResponse>(
        `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
        {
          headers: taskHeader,
          timeout: 15000,
        },
      );
      
      taskStatus = taskResponse.data.output.task_status;
      logger.log(`图片生成任务状态: ${taskStatus}, 重试次数: ${retryCount}`);
      
      if (taskStatus === 'SUCCEEDED') {
        const results = taskResponse.data.output.results;
        if (results && results.length > 0) {
          const images = results.map(r => r.url);
          logger.log('图片生成成功: ' + JSON.stringify(images));
          return {
            code: 0,
            data: {
              output: { images },
              outcome: 'success'
            }
          };
        }
      } else if (taskStatus === 'FAILED') {
        return {
          code: 1,
          message: '图片生成任务失败',
        };
      }
    }
    
    return {
      code: 1,
      message: '图片生成任务异常结束',
    };
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
