import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VibeForge — AI Future Self Simulator',
    short_name: 'VibeForge',
    description: 'Autonomous multi-agent life simulation and execution protocol engine.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0F',
    theme_color: '#7C3AED',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '64x64 32x32 24x24 16x16',
        type: 'image/x-icon',
      },
    ],
    categories: ['productivity', 'lifestyle', 'education'],
  };
}
