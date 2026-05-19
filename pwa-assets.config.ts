import {
  defineConfig,
  minimalPreset,
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
  headLinkOptions: {
    preset: '2023',
  },
  preset: {
    ...minimalPreset,
    apple: {
      sizes: [180],
      padding: 0.12,
    },
  },
  images: ['public/favicon.svg'],
})
