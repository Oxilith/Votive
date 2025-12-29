/**
 * @file src/hooks/useScrollReveal.ts
 * @purpose Enables scroll-triggered reveal animations for landing page elements
 * @functionality
 * - Observes elements with `.reveal` class using IntersectionObserver
 * - Adds `.visible` class when elements enter viewport, triggering CSS transitions
 * - Respects `prefers-reduced-motion` preference for accessibility
 * - Unobserves elements after animation to prevent re-triggering
 * @dependencies
 * - React (useEffect, useRef, RefObject)
 */

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Hook that enables scroll reveal animations on elements with `.reveal` class.
 * Elements animate once when they enter the viewport, then stop being observed.
 *
 * @param containerRef - Optional ref to scope observation to a specific container.
 *                       If not provided, observes entire document.
 */
const useScrollReveal = (containerRef?: RefObject<HTMLElement | null>): void => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      // Skip animations - make all elements visible immediately
      const scope = containerRef?.current ?? document;
      scope.querySelectorAll('.reveal').forEach((el) => {
        el.classList.add('visible');
      });
      return;
    }

    // Create observer for reveal animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Only animate once - stop observing after reveal
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        // Trigger slightly before element is fully in view
        rootMargin: '0px 0px -50px 0px',
      }
    );

    // Observe all reveal elements
    const scope = containerRef?.current ?? document;
    const elements = scope.querySelectorAll('.reveal');
    elements.forEach((el) => {
      observerRef.current?.observe(el);
    });

    // Cleanup
    return () => {
      observerRef.current?.disconnect();
    };
  }, [containerRef]);
};

export default useScrollReveal;
