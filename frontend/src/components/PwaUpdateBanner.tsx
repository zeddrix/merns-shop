import { Alert, Button, Container } from 'react-bootstrap';

interface PwaUpdateBannerProps {
  onReload: () => void;
  onDismiss: () => void;
}

const PwaUpdateBanner = ({ onReload, onDismiss }: PwaUpdateBannerProps) => {
  return (
    <Alert
      variant="info"
      className="pwa-update-banner mb-0 rounded-0"
      data-testid="pwa-update-banner"
    >
      <Container className="pwa-update-banner__inner">
        <span className="pwa-update-banner__message" data-testid="pwa-update-message">
          A new version of MERN&apos;s Shop is ready.
        </span>
        <div className="pwa-update-banner__actions" data-testid="pwa-update-actions">
          <Button size="sm" variant="primary" data-testid="pwa-update-reload" onClick={onReload}>
            Reload
          </Button>
          <Button
            size="sm"
            variant="outline-secondary"
            data-testid="pwa-update-dismiss"
            onClick={onDismiss}
          >
            Update Later
          </Button>
        </div>
      </Container>
    </Alert>
  );
};

export default PwaUpdateBanner;
