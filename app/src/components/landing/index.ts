/**
 * @file src/components/landing/index.ts
 * @purpose Barrel export file for landing page components
 * @functionality
 * - Exports LandingPage as default
 * - Exports all section components
 * - Exports all shared components
 * @dependencies
 * - Landing page components
 */

// Main landing page
export { default as LandingPage } from '@/components/landing/LandingPage';

// Section components
export { default as NavSection } from '@/components/landing/sections/NavSection';
export { default as HeroSection } from '@/components/landing/sections/HeroSection';
export { default as PhilosophySection } from '@/components/landing/sections/PhilosophySection';
export { default as JourneySection } from '@/components/landing/sections/JourneySection';
export { default as InsightsSection } from '@/components/landing/sections/InsightsSection';
export { default as CTASection } from '@/components/landing/sections/CTASection';
export { default as FooterSection } from '@/components/landing/sections/FooterSection';

// Shared components
export { default as VotiveLogo } from '@/components/landing/shared/VotiveLogo';
export { default as VoteCounter } from '@/components/landing/shared/VoteCounter';
export { default as PhaseCard } from '@/components/landing/shared/PhaseCard';
export { default as InsightPill } from '@/components/landing/shared/InsightPill';
