import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Oforo',
  description: 'Insights and updates from the Oforo team on AI, machine learning, and technology.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
