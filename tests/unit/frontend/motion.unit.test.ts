import { describe, expect, it } from 'vitest';
import {
  getPageTransition,
  getReducedMotionFromMatchMedia,
  getSearchOverlayTransition,
  getStaggerTransition
} from '../../../frontend/src/utils/motion';

describe('motion utilities', () => {
  it('getPageTransition_returns_zero_motion_when_reduced', () => {
    expect(getPageTransition(true)).toEqual({ duration: 0, y: 0 });
  });

  it('getPageTransition_returns_standard_motion_when_not_reduced', () => {
    expect(getPageTransition(false)).toEqual({ duration: 0.25, y: 8 });
  });

  it('getStaggerTransition_disables_stagger_when_reduced', () => {
    expect(getStaggerTransition(true)).toEqual({ staggerChildren: 0, delayChildren: 0 });
  });

  it('getStaggerTransition_enables_stagger_when_not_reduced', () => {
    expect(getStaggerTransition(false)).toEqual({ staggerChildren: 0.04, delayChildren: 0.02 });
  });

  it('getReducedMotionFromMatchMedia_reflects_query', () => {
    expect(getReducedMotionFromMatchMedia(true)).toBe(true);
    expect(getReducedMotionFromMatchMedia(false)).toBe(false);
  });

  it('getSearchOverlayTransition_returns_zero_motion_when_reduced', () => {
    expect(getSearchOverlayTransition(true)).toEqual({ duration: 0, y: 0 });
  });

  it('getSearchOverlayTransition_returns_slide_down_when_not_reduced', () => {
    expect(getSearchOverlayTransition(false)).toEqual({ duration: 0.3, y: '-100%' });
  });
});
