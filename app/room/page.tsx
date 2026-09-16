import type { Metadata } from 'next';
import Room from './room';

export const metadata: Metadata = {
  title: '小明的 3D 工作室 · 360° 互动作品集',
  description: '自由旋转一间真实 3D 微缩工作室，探索设计作品、个人经历与设计之外的生活。',
};

export default function RoomPage() {
  return <Room />;
}
