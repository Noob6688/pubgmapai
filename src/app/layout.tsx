import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import BlackHoleLoading from '@/components/home/BlackHoleLoading'
import { I18nProvider, getStaticTranslations } from '@/i18n'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PUBG密室位置全解密 - 寻找艾伦格地图隐藏宝藏',
  description: '深入探索PUBG绝地求生，揭秘各大地图的秘密密室位置与攻略。从泰戈的隐秘军火库到帝斯顿的未知空间，获取最全密室坐标，学习高效解锁技巧，提升你的游戏策略与胜率，成为战场中的探秘高手。',
  keywords: ['PUBG', 'pubg map', 'pubg地图', '艾伦格', 'erangel', '绝地求生', '密室位置', '密室攻略', 'PUBG密室', '绝地求生密室位置', '艾伦格地下密室', '泰戈地图密室', '帝斯顿地图密室', 'PUBG地图彩蛋', 'PUBG地图攻略', '密室钥匙', 'PUBG秘密区域', '密室坐标', '游戏攻略', 'PUBG密室解锁', '绝地求生攻略', '地图密室大全', 'pubg secret key', 'secret basement key pubg', 'pubg secret basement', 'erangel secret rooms', 'erangel secret basement'],
  authors: [{ name: 'PUBG' }],
  viewport: 'width=device-width, initial-scale=1.0',
  openGraph: {
    title: 'PUBG密室探险秘籍',
    description: '深入探索PUBG绝地求生，揭秘各大地图的秘密密室位置与攻略。从泰戈的隐秘军火库到帝斯顿的未知空间，获取最全密室坐标，学习高效解锁技巧，提升你的游戏策略与胜率，成为战场中的探秘高手。',
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
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="baidu-site-verification" content="codeva-cdUD5IZkip" />
        <meta name="baidu-site-verification" content="codeva-xS6AgmmK5V" />
        <script async src="//js.users.51.la/21898489.js"></script>
      </head>
      <body className={inter.className}>
        <I18nProvider>
          {children}
          <BlackHoleLoading />
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  )
}
