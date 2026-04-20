const localtunnel = require('localtunnel');

(async () => {
  const tunnel = await localtunnel({ port: 5173 });
  
  tunnel.on('close', () => {
    console.log('Tunnel closed');
  });
  
  tunnel.on('error', (err) => {
    console.error('Tunnel error:', err);
  });
  
  console.log('✅ 隧道已开启！');
  console.log('📱 可以分享给微信好友的链接：');
  console.log('🔗', tunnel.url);
  console.log('');
  console.log('💡 提示：请保持此终端窗口打开，按 Ctrl+C 停止');
})();