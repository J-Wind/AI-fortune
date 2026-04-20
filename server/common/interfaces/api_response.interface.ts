// 响应接口定义
import { HttpStatus } from '@nestjs/common';

// 错误统一响应
export interface ApiErrorResponse {
  /** 错误详情 */
  error: {
    /** 错误代码 */
    code: string;
    /** 错误消息 */
    message: string;
    /** 错误详情 */
    details?: string;
    /** 字段验证错误 */
    fieldErrors?: Record<string, string[]>;
    /** 调用栈（仅开发环境） */
    stack?: string;
    /** 错误发生时间 */
    timestamp?: number;
  };
}

