import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt';

const PwaInstallButton = () => {
  const { canInstall, install } = usePwaInstallPrompt();

  if (!canInstall) {
    return null;
  }

  return (
    <button
      type="button"
      className="nav-pwa-install touch-target"
      data-testid="pwa-install-header-button"
      aria-label="Install app"
      onClick={() => void install()}
    >
      <i className="fas fa-download" aria-hidden="true" />
    </button>
  );
};

export default PwaInstallButton;
