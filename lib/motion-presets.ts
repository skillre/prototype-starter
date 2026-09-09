import type { Transition, Variants } from "motion/react"

/**
 * Motion presets — the JS mirror of the "Design tokens: motion" block in
 * app/globals.css. Keep the two in sync. Prefer these constants over ad-hoc
 * durations/easings anywhere in the codebase.
 */

export const durations = {
  instant: 0.1,
  fast: 0.18,
  normal: 0.28,
  slow: 0.5,
  glacial: 0.9,
} as const

export const easings = {
  standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
  outExpo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  outBack: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
} as const

/** Soft, natural spring — good for layout shift (drawers own their motion, cards use this for hover). */
export const softSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.6,
}

/** Shared stagger orchestration: place on the container, item variants on children. */
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

/** Default stagger item — combine with <motion.div variants={staggerItem}>. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.99 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: durations.normal, ease: easings.outExpo },
  },
}

/** Entrance used by FadeIn / SlideIn / ScaleIn when custom props are not given. */
export const enter = (delay = 0, duration = durations.normal): Transition => ({
  delay,
  duration,
  ease: easings.outExpo,
})