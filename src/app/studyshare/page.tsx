import type { Metadata } from 'next';
import StudySpace from '../../components/study/StudySpace';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: '一起学 · Study together | Jingqing Liu',
  description: '和学习伙伴一起读书、练习、记录时间，让每一步进步都有迹可循。',
};

export default function StudySharePage() {
  return <StudySpace />;
}
