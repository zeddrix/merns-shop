import { usePwaInstallContext } from '../context/PwaInstallContext';
import AppIcon from './icons/AppIcon';
import { faDownload } from './icons';

const PwaInstallButton = () => {
  const { showInstallButton, install } = usePwaInstallContext();

  if (!showInstallButton) {
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
