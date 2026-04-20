const tseslint = require('typescript-eslint');
const { eslintPresets } = require('@lark-apaas/fullstack-presets');

module.exports = tseslint.config(
  { ignores: ['dist', 'node_modules', 'client/src/api/gen'] },
  // Client configuration
  {
    files: ['client/**/*.{ts,tsx}'],
    extends: [
      ...eslintPresets.client,
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.app.json',
      },
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [
            ['@', './client/src'],
            ['@client', './client'],
          ],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
  // Server configuration
  {
    files: ['server/**/*.{ts,tsx}'],
    extends: [
      ...eslintPresets.server,
    ],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.node.json',
      }
    },
    settings: {
      'import/resolver': {
        alias: {
          map: [['@server', './server']],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      }
    }
  },
);
