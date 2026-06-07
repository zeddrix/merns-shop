import { Alert, Button } from 'react-bootstrap';

interface PwaUpdateBannerProps {
  onReload: () => void;
  onDismiss: () => void;
}

const PwaUpdateBanner = ({ onReload, onDismiss }: PwaUpdateBannerProps) => {
  return (
    <Alert
      variant="info"
      className="pwa-update-banner mb-0 rounded-0 d-flex flex-wrap align-items-center justify-content-center gap-2"
      data-testid="pwa-update-banner"
    >
      <span>A new version of MERN&apos;s Shop is ready.</span>
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
    </Alert>
  );
};

export default PwaUpdateBanner;
