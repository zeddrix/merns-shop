import type { UserInfo } from '../types';

export const hasSession = (userInfo?: UserInfo): boolean => Boolean(userInfo?._id);
