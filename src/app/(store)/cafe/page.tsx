import type { Metadata } from 'next';
import CafeClient from "@/components/cafe/CafeClient";

export const metadata: Metadata = {
  title: 'Cafe & Culinary Experiences | Fleñjure',
  description: 'Explore the Fleñjure Cafe. Gourmet dining, exclusive recipes, and culinary experiences celebrating life and taste.',
};

export default function CafePage() {
  return <CafeClient />;
}
