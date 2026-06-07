import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Offcanvas } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addNotificationFromPush,
  fetchNotifications,
  markNotificationRead,
  setLastPushTitle
} from '../features/pushSlice';

const NotificationBell = () => {
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((state) => state.userLogin.userInfo);
  const { notifications, lastPushTitle } = useAppSelector((state) => state.push);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userInfo) {
      return;
    }
    void dispatch(fetchNotifications());
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (!userInfo || !('serviceWorker' in navigator)) {
      return;
    }

    const handler = (event: MessageEvent) => {
      const data = event.data as {
        type?: string;
        payload?: { title?: string; body?: string; url?: string; tag?: string };
      };
      if (data?.type !== 'push-received' || !data.payload?.title) {
        return;
      }

      dispatch(setLastPushTitle(data.payload.title));
      dispatch(
        addNotificationFromPush({
          _id: `push-${Date.now()}`,
          type: data.payload.tag === 'order_delivered' ? 'order_delivered' : 'order_paid',
          title: data.payload.title,
          body: data.payload.body ?? '',
          url: data.payload.url ?? '/profile',
          read: false,
          createdAt: new Date().toISOString()
        })
      );
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [dispatch, userInfo]);

  if (!userInfo) {
    return null;
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <>
      <div className="notification-bell-wrap">
        <Button
          variant="dark"
          className="notification-bell touch-target"
          data-testid="notification-bell"
          aria-label="Notifications"
          onClick={() => {
            void dispatch(fetchNotifications());
            setOpen(true);
          }}
        >
          <i className="fas fa-bell" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge
              bg="danger"
              className="notification-bell__badge"
              data-testid="notification-unread-count"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
        {lastPushTitle && (
          <span className="visually-hidden" data-testid="notification-last-push-title">
            {lastPushTitle}
          </span>
        )}
      </div>

      <Offcanvas show={open} onHide={() => setOpen(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Notifications</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body data-testid="notification-list">
          {notifications.length === 0 ? (
            <p className="text-muted mb-0">No notifications yet.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`notification-item${notification.read ? '' : ' notification-item--unread'}`}
                data-testid={`notification-item-${notification._id}`}
              >
                <strong data-testid={`notification-title-${notification._id}`}>
                  {notification.title}
                </strong>
                <p className="mb-2">{notification.body}</p>
                <Link
                  to={notification.url}
                  className="btn btn-sm btn-light"
                  data-testid={`notification-link-${notification._id}`}
                  onClick={() => {
                    if (!notification.read && !notification._id.startsWith('push-')) {
                      void dispatch(markNotificationRead(notification._id));
                    }
                    setOpen(false);
                  }}
                >
                  View
                </Link>
              </div>
            ))
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default NotificationBell;
