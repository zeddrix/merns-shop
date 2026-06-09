import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchNotifications, markNotificationRead } from '../features/pushSlice';

interface NotificationPopoverProps {
  onClose: () => void;
}

const NotificationPopover = ({ onClose }: NotificationPopoverProps) => {
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector((state) => state.push);

  useEffect(() => {
    void dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div
      className="notification-popover-panel header-panel-dark"
      data-testid="notification-popover"
    >
      <h2 className="header-panel-title h6 mb-3">Notifications</h2>
      <div data-testid="notification-list">
        {notifications.length === 0 ? (
          <p className="text-muted mb-0 small">No notifications yet.</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item${notification.read ? '' : ' notification-item--unread'}`}
              data-testid={`notification-item-${notification._id}`}
            >
              <strong
                className="small d-block mb-1"
                data-testid={`notification-title-${notification._id}`}
              >
                {notification.title}
              </strong>
              <p className="mb-2 small text-muted">{notification.body}</p>
              <Link
                to={notification.url}
                className="btn btn-sm btn-outline-light"
                data-testid={`notification-link-${notification._id}`}
                onClick={() => {
                  if (!notification.read && !notification._id.startsWith('push-')) {
                    void dispatch(markNotificationRead(notification._id));
                  }
                  onClose();
                }}
              >
                View
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPopover;
