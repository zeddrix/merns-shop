import { Alert } from 'react-bootstrap';
import { useSlowServerNotice } from '../hooks/useSlowServerNotice';
import { SLOW_SERVER_NOTICE_MESSAGE } from '../constants/slowServerNotice';

const SlowServerBanner = () => {
  const showNotice = useSlowServerNotice();

  if (!showNotice) {
    return null;
  }

  return (
    <Alert
      variant="info"
      className="slow-server-banner mb-0 rounded-0 text-center"
      data-testid="slow-server-banner"
    >
      {SLOW_SERVER_NOTICE_MESSAGE}
    </Alert>
  );
};

export default SlowServerBanner;
