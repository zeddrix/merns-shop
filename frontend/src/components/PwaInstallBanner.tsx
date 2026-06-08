import { Alert, Button, Container } from 'react-bootstrap';
import { usePwaInstallContext } from '../context/PwaInstallContext';

const PwaInstallBanner = () => {
  const { showInstallBanner, install, dismissBanner } = usePwaInstallContext();

  if (!showInstallBanner) {
    return null;
  }

  return (
    <Alert
      variant="secondary"
      className="pwa-install-banner mb-0 rounded-0"
      data-testid="pwa-install-banner"
    >
      <Container className="pwa-install-banner__inner">
        <span className="pwa-install-banner__message">
          Install MERN&apos;s Shop for quick access and offline browsing.
        </span>
        <div className="pwa-install-banner__actions">
          <Button
            size="sm"
            variant="primary"
            data-testid="pwa-install-button"
            onClick={() => void install()}
          >
            Install
          </Button>
          <Button
            size="sm"
            variant="outline-secondary"
            data-testid="pwa-install-dismiss"
            onClick={dismissBanner}
          >
            Not now
          </Button>
        </div>
      </Container>
    </Alert>
  );
};

export default PwaInstallBanner;
