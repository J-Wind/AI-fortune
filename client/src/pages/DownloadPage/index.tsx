import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { Download, FileArchive, Code2, Package } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';

export default function DownloadPage() {
  const handleDownload = async () => {
    try {
      const response = await axiosForBackend.get('/api/download/app', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ai-fortune-export.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full shadow-xl border-orange-200">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Download className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            下载 AI 卜卦源码
          </CardTitle>
          <CardDescription className="text-base mt-2">
            获取完整的项目代码，可在 Trae IDE 中进行二次开发
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <FileArchive className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-700">包含配置文件（package.json, tsconfig 等）</span>
            </div>
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-700">包含前端全部源码（client/src/）</span>
            </div>
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-700">包含后端全部源码（server/）</span>
            </div>
          </div>

          <Button
            onClick={handleDownload}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white text-base py-6"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            立即下载源码包
          </Button>

          <p className="text-xs text-gray-500 text-center">
            下载后解压即可在 Trae IDE 中打开进行二次开发
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
