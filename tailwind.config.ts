import { createTailwindPreset } from '@lark-apaas/fullstack-presets';

export default {
  presets: [createTailwindPreset()],
  content: [
    './client/src/**/*.{ts,tsx,css}',
  ],
  plugins: [],
}