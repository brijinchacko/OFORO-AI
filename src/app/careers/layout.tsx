import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers - Oforo',
  description: 'Join the Oforo team. Explore open positions in AI engineering, development, design, and data science.',
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
