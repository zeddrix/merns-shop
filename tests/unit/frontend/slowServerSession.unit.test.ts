import { describe, expect, it, beforeEach } from 'vitest';
import { SLOW_SERVER_SESSION_WARMED_KEY } from '../../../frontend/src/constants/slowServerNotice';
import {
  clearSlowServerSessionWarmed,
  isSlowServerSessionWarmed,
  markSlowServerSessionWarmed
} from '../../../frontend/src/utils/slowServerSession';

describe('slowServerSession', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('returns_false_when_session_not_warmed', () => {
    expect(isSlowServerSessionWarmed()).toBe(false);
  });

  it('returns_true_after_markSlowServerSessionWarmed', () => {
    markSlowServerSessionWarmed();
    expect(isSlowServerSessionWarmed()).toBe(true);
    expect(sessionStorage.getItem(SLOW_SERVER_SESSION_WARMED_KEY)).toBe('1');
  });

  it('clearSlowServerSessionWarmed_removes_warmed_flag', () => {
    markSlowServerSessionWarmed();
    clearSlowServerSessionWarmed();
    expect(isSlowServerSessionWarmed()).toBe(false);
  });
});
