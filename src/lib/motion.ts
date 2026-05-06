/**
 * Motion tokens. Every animation in the dashboard references these.
 * Values tuned for "premium product" feel — short durations,
 * physics-based easing, restrained.
 */

export const easing = {
    /** Default easing — material-y, used for most state changes */
    default: [0.4, 0, 0.2, 1] as const,
    /** "Product" easing — softer entrance, used by Linear/Vercel */
    product: [0.32, 0.72, 0, 1] as const,
    /** Spring-y bounce for celebratory moments. Use sparingly. */
    bounce: [0.68, -0.55, 0.265, 1.55] as const,
  } as const
  
  export const duration = {
    fast: 0.12,
    default: 0.2,
    slow: 0.32,
    chart: 0.48,
    reveal: 0.6,
  } as const
  
  export const spring = {
    /** Soft spring for hover and focus states */
    soft: { type: "spring" as const, stiffness: 380, damping: 30 },
    /** Stiffer spring for slide-ins and reveals */
    brisk: { type: "spring" as const, stiffness: 520, damping: 35 },
    /** Gentle settle for count-up and number changes */
    settle: { type: "spring" as const, stiffness: 100, damping: 20 },
  } as const
  
  /**
   * Standard reveal — used for cards, sections, and tiles entering the page.
   * Subtle: fade + small Y translate + 200ms duration.
   */
  export const revealVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  }
  
  export const revealTransition = {
    duration: duration.reveal,
    ease: easing.product,
  }
  
  /**
   * Stagger config for reveal sequences (KPI strip tiles, watch list, etc).
   * Each item appears 60ms after the previous one.
   */
  export const staggerContainer = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  }