import type { Metadata } from 'next';
import './globals.css';
import { asset } from './asset';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://finn-aigc-portfolio.fanyiming555.chatgpt.site'),
  title: 'Finn — AIGC Visual Designer',
  description: '小明 / Finn 的个人设计作品集，探索 AIGC、视觉设计与数字体验。',
  icons: { icon: asset('/icon.png') },
  openGraph: {
    title: 'Finn — AIGC Visual Designer',
    description: '小明 / Finn 的个人设计作品集，探索 AIGC、视觉设计与数字体验。',
    images: [asset('/og.png')],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finn — AIGC Visual Designer',
    description: '小明 / Finn 的个人设计作品集。',
    images: [asset('/og.png')],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
