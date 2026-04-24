import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sallie AI Studio',
    short_name: 'Sallie AI',
    description: 'Your Personal AI Companion - A next-generation AI assistant with voice, avatar, and intelligent conversations',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F0A1A',
    theme_color: '#6B21A8',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en',
    categories: ['productivity', 'utilities', 'lifestyle'],
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable' as const
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable' as const
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable' as const
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable' as const
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable' as const
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable' as const
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable' as const
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable' as const
      }
    ],
    screenshots: [
      {
        src: '/screenshots/chat.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Chat Interface'
      },
      {
        src: '/screenshots/dashboard.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Dashboard'
      },
      {
        src: '/screenshots/mobile-chat.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Mobile Chat'
      }
    ],
    shortcuts: [
      {
        name: 'New Chat',
        short_name: 'Chat',
        description: 'Start a new conversation with Sallie',
        url: '/dashboard?action=new-chat',
        icons: [{ src: '/icons/chat-icon.png', sizes: '96x96' }]
      },
      {
        name: 'Voice Mode',
        short_name: 'Voice',
        description: 'Start voice conversation',
        url: '/dashboard?mode=voice',
        icons: [{ src: '/icons/voice-icon.png', sizes: '96x96' }]
      },
      {
        name: 'Settings',
        short_name: 'Settings',
        description: 'Open settings',
        url: '/settings',
        icons: [{ src: '/icons/settings-icon.png', sizes: '96x96' }]
      }
    ],
    related_applications: [
      {
        platform: 'play',
        url: 'https://play.google.com/store/apps/details?id=com.sallie.studio',
        id: 'com.sallie.studio'
      },
      {
        platform: 'itunes',
        url: 'https://apps.apple.com/app/sallie-ai-studio/id1234567890'
      }
    ],
    prefer_related_applications: false,
    launch_handler: {
      client_mode: 'navigate-existing' as const
    }
  }
}
