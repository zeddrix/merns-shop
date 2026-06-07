import { DISPLAY_BRAND_NAME } from '../constants/brand';

export const PWA_MANIFEST = {
  name: DISPLAY_BRAND_NAME,
  short_name: "MERN's Shop",
  description: 'Shop phones, tablets, and electronics with fast checkout.',
  id: '/',
  start_url: '/',
  scope: '/',
  display: 'standalone' as const,
  orientation: 'portrait' as const,
  theme_color: '#212529',
  background_color: '#ffffff',
  categories: ['shopping', 'business'],
  display_override: ['standalone', 'minimal-ui'] as ['standalone', 'minimal-ui'],
  launch_handler: {
    client_mode: 'focus-existing' as const
  },
  shortcuts: [
    {
      name: 'Shop',
      short_name: 'Shop',
      url: '/',
      icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }]
    },
    {
      name: 'Cart',
      short_name: 'Cart',
      url: '/cart',
      icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }]
    },
    {
      name: 'Profile',
      short_name: 'Profile',
      url: '/profile',
      icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }]
    }
  ],
  icons: [
    {
      src: '/icons/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/icons/icon-512-maskable.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ]
};
