import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FitStamp - 運動習慣トラッカー',
    short_name: 'FitStamp',
    description: '毎日の運動習慣をスタンプで記録しよう。',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#f97316',
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
