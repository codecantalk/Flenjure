import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sights & Sounds',
  description: 'Curated audio tracks, visual lookbooks, and sensory experiences from Fleñjure. Elevate your living with our exclusive aesthetic atmosphere.',
};

export default function SightsAndSoundsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
