import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PUBG密室位置全解密 - 寻找艾伦格地图隐藏宝藏',
  description: '解释PUBG密室之谜，PUBG艾伦格地图密室详细位置尽在掌控之中，掌握地图上每一个隐藏宝藏的位置，成为战场的智者.',
  authors: [{ name: 'PUBG' }],
  openGraph: {
    title: 'PUBG密室探险秘籍',
    description: '解释PUBG密室之谜，PUBG艾伦格地图密室详细位置尽在掌控之中，掌握地图上每一个隐藏宝藏的位置，成为战场的智者.',
    url: 'https://pubgmap.top',
    siteName: 'PUBG地图密室',
    images: [
      {
        url: 'https://r2.pubgmaptile.top/public/map.png',
        secureUrl: 'https://r2.pubgmaptile.top/public/map.png',
        width: 1000,
        height: 1000,
        type: 'image/png',
      },
    ],
    type: 'article',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <script async src="//js.users.51.la/21898489.js"></script>
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
