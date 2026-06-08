interface PwaInstallHintProps {
  onClose: () => void;
}

const isIosDevice = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return /iPad|iPhone|iPod/.test(nav.userAgent) && !nav.standalone;
};

const PwaInstallHint = ({ onClose }: PwaInstallHintProps) => {
  const message = isIosDevice()
    ? "Tap Share, then choose Add to Home Screen to install MERN's Shop."
    : "Use your browser menu and choose Install MERN's Shop (or Install app).";

  return (
    <div className="pwa-install-hint-backdrop" data-testid="pwa-install-hint">
      <div className="pwa-install-hint-panel" role="dialog" aria-label="Install instructions">
        <p className="pwa-install-hint-message">{message}</p>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          data-testid="pwa-install-hint-close"
          onClick={onClose}
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default PwaInstallHint;
