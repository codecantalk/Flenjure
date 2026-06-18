import type { Metadata } from 'next';
import CafeClient from "@/components/cafe/CafeClient";

export const metadata: Metadata = {
  title: 'Cafe & Culinary Experiences | Fleñjure',
  description: 'Explore the Fleñjure Cafe. Gourmet dining, exclusive recipes, and culinary experiences designed to elevate your living and taste.',
};

export default function CafePage() {
  return <CafeClient />;
}
