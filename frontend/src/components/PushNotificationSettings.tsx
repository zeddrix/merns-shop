import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchPushPreferences,
  fetchVapidPublicKey,
  savePushPreferences
} from '../features/pushSlice';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Form, Button, Alert } from 'react-bootstrap';
import Message from './Message';

const PushNotificationSettings = () => {
  const dispatch = useAppDispatch();
  const { subscribeIfEnabled } = usePushNotifications();
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);
  const { vapidPublicKey, preferences, loadingPreferences, savingPreferences, error } =
    useAppSelector((state) => state.push);
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userInfo) {
      return;
    }
    void dispatch(fetchVapidPublicKey());
    void dispatch(fetchPushPreferences());
  }, [dispatch, userInfo]);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const saveHandler = useCallback(async () => {
    setSaveMessage(null);

    const subscribeResult = await subscribeIfEnabled(localPrefs, vapidPublicKey);
    if (subscribeResult && !subscribeResult.ok) {
      setSaveMessage(subscribeResult.message);
      return;
    }

    await dispatch(savePushPreferences(localPrefs)).unwrap();
    setSaveMessage('Notification preferences saved.');
  }, [dispatch, localPrefs, subscribeIfEnabled, vapidPublicKey]);

  if (!userInfo) {
    return null;
  }

  return (
    <div className="mt-4" data-testid="push-settings">
      <h3>Notifications</h3>
      {error && <Message variant="danger">{error}</Message>}
      {saveMessage && (
        <Alert variant="success" data-testid="push-settings-message">
          {saveMessage}
        </Alert>
      )}
      {loadingPreferences ? (
        <p>Loading notification settings…</p>
      ) : (
        <Form
          onSubmit={(event) => {
            event.preventDefault();
            void saveHandler();
          }}
        >
          <Form.Check
            type="switch"
            id="push-enabled"
            label="Enable push notifications"
            data-testid="push-settings-enabled"
            checked={localPrefs.pushEnabled}
            onChange={(event) =>
              setLocalPrefs((current) => ({ ...current, pushEnabled: event.target.checked }))
            }
          />
          <Form.Check
            type="checkbox"
            id="push-order-paid"
            label="Order payment confirmed"
            data-testid="push-settings-order-paid"
            checked={localPrefs.orderPaid}
            onChange={(event) =>
              setLocalPrefs((current) => ({ ...current, orderPaid: event.target.checked }))
            }
          />
          <Form.Check
            type="checkbox"
            id="push-order-delivered"
            label="Order delivered"
            data-testid="push-settings-order-delivered"
            checked={localPrefs.orderDelivered}
            onChange={(event) =>
              setLocalPrefs((current) => ({ ...current, orderDelivered: event.target.checked }))
            }
          />
          <Button
            type="submit"
            variant="primary"
            className="mt-2"
            data-testid="push-settings-save"
            disabled={savingPreferences}
          >
            {savingPreferences ? 'Saving…' : 'Save notification settings'}
          </Button>
        </Form>
      )}
    </div>
  );
};

export default PushNotificationSettings;
