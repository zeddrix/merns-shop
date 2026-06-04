export interface PageTransitionConfig {
  duration: number;
  y: number;
}

export function getPageTransition(reducedMotion: boolean): PageTransitionConfig {
  if (reducedMotion) {
    return { duration: 0, y: 0 };
  }
  return { duration: 0.25, y: 8 };
}

export function getStaggerTransition(reducedMotion: boolean): {
  staggerChildren: number;
  delayChildren: number;
} {
  if (reducedMotion) {
    return { staggerChildren: 0, delayChildren: 0 };
  }
  return { staggerChildren: 0.04, delayChildren: 0.02 };
}

export function getReducedMotionFromMatchMedia(matches: boolean): boolean {
  return matches;
}
