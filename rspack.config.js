const path = require('path');
module.exports = {
  extends: '@lark-apaas/fullstack-rspack-preset/preset.config.js',
  entry: {
    main: './client/src/index.tsx',
  },
  resolve: {
    tsConfig: {
      configFile: path.resolve(__dirname, './tsconfig.app.json'),
    },
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
    },
  },
};