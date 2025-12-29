/**
 * @file src/components/landing/LandingPage.tsx
 * @purpose Main landing page orchestrator composing all landing sections
 * @functionality
 * - Orchestrates all landing page sections in proper order
 * - Adds ma-vertical dividers between sections for visual rhythm
 * - Manages navigation to assessment via onStartDiscovery callback
 * - Provides smooth scrolling anchor navigation
 * - Integrates with theme context and i18n
 * @dependencies
 * - React
 * - @/components/landing/sections/NavSection
 * - @/components/landing/sections/HeroSection
 * - @/components/landing/sections/PhilosophySection
 * - @/components/landing/sections/JourneySection
 * - @/components/landing/sections/InsightsSection
 * - @/components/landing/sections/CTASection
 * - @/components/landing/sections/FooterSection
 */

import type { FC } from 'react';
import NavSection from '@/components/landing/sections/NavSection';
import HeroSection from '@/components/landing/sections/HeroSection';
import PhilosophySection from '@/components/landing/sections/PhilosophySection';
import JourneySection from '@/components/landing/sections/JourneySection';
import InsightsSection from '@/components/landing/sections/InsightsSection';
import CTASection from '@/components/landing/sections/CTASection';
import FooterSection from '@/components/landing/sections/FooterSection';

interface LandingPageProps {
  onStartDiscovery: () => void;
}

/**
 * Ma-vertical divider component - intentional space with brush-reveal animation
 */
const MaVertical: FC = () => (
  <div className="ma-vertical h-px max-w-[200px] mx-auto my-28 bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent" />
);

/**
 * Ma-breath - additional vertical breathing space
 */
const MaBreath: FC = () => <div className="h-28" />;

const LandingPage: FC<LandingPageProps> = ({ onStartDiscovery }) => {
  return (
    <div className="min-h-screen">
      <NavSection onStartDiscovery={onStartDiscovery} />
      <HeroSection onStartDiscovery={onStartDiscovery} />
      <PhilosophySection />
      <MaVertical />
      <MaBreath />
      <JourneySection />
      <MaVertical />
      <InsightsSection />
      <CTASection onStartDiscovery={onStartDiscovery} />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
