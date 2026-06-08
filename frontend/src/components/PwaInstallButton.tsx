import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt';
import AppIcon from './icons/AppIcon';
import { faDownload } from './icons';

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
      <AppIcon icon={faDownload} />
    </button>
  );
};

export default PwaInstallButton;
