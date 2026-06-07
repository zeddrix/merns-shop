import type { Mock } from 'vitest';

declare global {
  var __pushSendNotificationMock: Mock;
}

export function getSendNotificationMock(): Mock {
  return globalThis.__pushSendNotificationMock;
}
