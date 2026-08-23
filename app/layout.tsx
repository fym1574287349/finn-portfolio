import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Finn — AIGC Visual Designer',
  description: '小明 / Finn 的个人设计作品集，探索 AIGC、视觉设计与数字体验。',
  icons: { icon: '/icon.png' },
  openGraph: {
    title: 'Finn — AIGC Visual Designer',
    description: '小明 / Finn 的个人设计作品集，探索 AIGC、视觉设计与数字体验。',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finn — AIGC Visual Designer',
    description: '小明 / Finn 的个人设计作品集。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
