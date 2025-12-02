/**
 * Animation utilities and reusable motion variants
 * Respects user's motion preferences for accessibility
 */

import type { Transition, Variants } from 'framer-motion'

/**
 * Check if user prefers reduced motion
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Get transition duration based on user preference
 */
export const getTransitionDuration = (duration: number): number => {
  return shouldReduceMotion() ? 0 : duration
}

/**
 * Default transition settings
 */
export const defaultTransition: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1], // Custom easing curve
}

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

export const smoothTransition: Transition = {
  duration: 0.4,
  ease: 'easeInOut',
}

/**
 * Fade in animation
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: defaultTransition,
  },
}

/**
 * Fade in with slide up
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: defaultTransition,
  },
}

/**
 * Fade in with slide down
 */
export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: defaultTransition,
  },
}

/**
 * Fade in with slide from left
 */
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: defaultTransition,
  },
}

/**
 * Fade in with slide from right
 */
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: defaultTransition,
  },
}

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: springTransition,
  },
}

/**
 * Stagger container for children animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
}

/**
 * Stagger item (used with staggerContainer)
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: defaultTransition,
  },
}

/**
 * Slide in from right (for modals, drawers)
 */
export const slideInRight: Variants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0,
    transition: smoothTransition,
  },
  exit: { 
    x: '100%',
    transition: smoothTransition,
  },
}

/**
 * Slide in from left
 */
export const slideInLeft: Variants = {
  hidden: { x: '-100%' },
  visible: { 
    x: 0,
    transition: smoothTransition,
  },
  exit: { 
    x: '-100%',
    transition: smoothTransition,
  },
}

/**
 * Slide in from bottom (for toasts, notifications)
 */
export const slideInUp: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { 
    y: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: { 
    y: '100%',
    opacity: 0,
    transition: defaultTransition,
  },
}

/**
 * Bounce animation
 */
export const bounce: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.2, 0.9, 1.1, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.2, 0.4, 0.6, 1],
    },
  },
}

/**
 * Shake animation (for errors)
 */
export const shake: Variants = {
  initial: { x: 0 },
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
    },
  },
}

/**
 * Pulse animation
 */
export const pulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

/**
 * Hover scale animation config
 */
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: springTransition,
}

/**
 * Hover lift animation config
 */
export const hoverLift = {
  whileHover: { y: -4 },
  whileTap: { y: 0 },
  transition: defaultTransition,
}

/**
 * Image zoom hover effect
 */
export const imageZoom = {
  whileHover: { scale: 1.1 },
  transition: { duration: 0.4, ease: 'easeOut' },
}

/**
 * Button ripple effect config
 */
export const rippleConfig = {
  initial: { scale: 0, opacity: 0.5 },
  animate: { scale: 2, opacity: 0 },
  transition: { duration: 0.6 },
}

/**
 * Modal/Dialog backdrop animation
 */
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Card hover animation
 */
export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    y: -8,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
}

/**
 * Success checkmark animation
 */
export const checkmarkVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: 'easeInOut' },
      opacity: { duration: 0.3 },
    },
  },
}

/**
 * Layout animation config (for smooth position changes)
 */
export const layoutTransition = {
  layout: true,
  transition: defaultTransition,
}

/**
 * Number counter animation
 */
export const numberCounterConfig = {
  initial: { y: -20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
  transition: { duration: 0.2 },
}
