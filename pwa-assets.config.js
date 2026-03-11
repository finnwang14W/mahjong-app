import { defineConfig, minimalPreset } from '@vite-pwa/assets-generator/config';

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: minimalPreset,
  images: ['public/icon.svg'],
});
