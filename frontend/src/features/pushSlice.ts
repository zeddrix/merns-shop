import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { axios } from '../api/http';

export interface NotificationPreference {
  pushEnabled: boolean;
  orderPaid: boolean;
  orderDelivered: boolean;
}

export interface AppNotification {
  _id: string;
  type: 'order_paid' | 'order_delivered';
  title: string;
  body: string;
  url: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export interface PushState {
  vapidPublicKey: string | null;
  preferences: NotificationPreference;
  notifications: AppNotification[];
  loadingPreferences: boolean;
  loadingNotifications: boolean;
  savingPreferences: boolean;
  error: string | null;
  lastPushTitle: string | null;
}

const initialState: PushState = {
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY ?? null,
  preferences: {
    pushEnabled: false,
    orderPaid: true,
    orderDelivered: true
  },
  notifications: [],
  loadingPreferences: false,
  loadingNotifications: false,
  savingPreferences: false,
  error: null,
  lastPushTitle: null
};

export const fetchVapidPublicKey = createAsyncThunk('push/fetchVapidPublicKey', async () => {
  const { data } = await axios.get<{ publicKey: string }>('/api/push/vapid-public-key');
  return data.publicKey;
});

export const fetchPushPreferences = createAsyncThunk('push/fetchPushPreferences', async () => {
  const { data } = await axios.get<NotificationPreference & { _id: string }>(
    '/api/push/preferences'
  );
  return data;
});

export const savePushPreferences = createAsyncThunk(
  'push/savePushPreferences',
  async (preferences: NotificationPreference) => {
    const { data } = await axios.put<NotificationPreference & { _id: string }>(
      '/api/push/preferences',
      preferences
    );
    return data;
  }
);

export const subscribePush = createAsyncThunk(
  'push/subscribePush',
  async (subscription: PushSubscriptionJSON) => {
    await axios.post('/api/push/subscribe', subscription);
  }
);

export const fetchNotifications = createAsyncThunk('push/fetchNotifications', async () => {
  const { data } = await axios.get<AppNotification[]>('/api/push/notifications');
  return data;
});

export const markNotificationRead = createAsyncThunk(
  'push/markNotificationRead',
  async (notificationId: string) => {
    const { data } = await axios.put<AppNotification>(
      `/api/push/notifications/${notificationId}/read`
    );
    return data;
  }
);

const pushSlice = createSlice({
  name: 'push',
  initialState,
  reducers: {
    setLastPushTitle(state, action: PayloadAction<string | null>) {
      state.lastPushTitle = action.payload;
    },
    addNotificationFromPush(state, action: PayloadAction<AppNotification>) {
      state.notifications = [
        action.payload,
        ...state.notifications.filter((n) => n._id !== action.payload._id)
      ];
      state.lastPushTitle = action.payload.title;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVapidPublicKey.fulfilled, (state, action) => {
        state.vapidPublicKey = action.payload;
      })
      .addCase(fetchPushPreferences.pending, (state) => {
        state.loadingPreferences = true;
        state.error = null;
      })
      .addCase(fetchPushPreferences.fulfilled, (state, action) => {
        state.loadingPreferences = false;
        state.preferences = {
          pushEnabled: action.payload.pushEnabled,
          orderPaid: action.payload.orderPaid,
          orderDelivered: action.payload.orderDelivered
        };
      })
      .addCase(fetchPushPreferences.rejected, (state, action) => {
        state.loadingPreferences = false;
        state.error = action.error.message ?? 'Failed to load push preferences';
      })
      .addCase(savePushPreferences.pending, (state) => {
        state.savingPreferences = true;
        state.error = null;
      })
      .addCase(savePushPreferences.fulfilled, (state, action) => {
        state.savingPreferences = false;
        state.preferences = {
          pushEnabled: action.payload.pushEnabled,
          orderPaid: action.payload.orderPaid,
          orderDelivered: action.payload.orderDelivered
        };
      })
      .addCase(savePushPreferences.rejected, (state, action) => {
        state.savingPreferences = false;
        state.error = action.error.message ?? 'Failed to save push preferences';
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.loadingNotifications = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loadingNotifications = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.loadingNotifications = false;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map((notification) =>
          notification._id === action.payload._id ? action.payload : notification
        );
      });
  }
});

export const { setLastPushTitle, addNotificationFromPush } = pushSlice.actions;
export const pushReducer = pushSlice.reducer;
