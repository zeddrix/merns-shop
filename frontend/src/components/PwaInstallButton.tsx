import { useState } from 'react';
import { usePwaInstallContext } from '../context/PwaInstallContext';
import AppIcon from './icons/AppIcon';
import { faDownload } from './icons';
import PwaInstallHint from './PwaInstallHint';

const PwaInstallButton = () => {
  const { showInstallButton, hasNativePrompt, install } = usePwaInstallContext();
  const [hintOpen, setHintOpen] = useState(false);

  if (!showInstallButton) {
    return null;
  }

  const clickHandler = () => {
    if (hasNativePrompt) {
      void install();
      return;
    }
    setHintOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className="nav-pwa-install touch-target"
        data-testid="pwa-install-header-button"
        aria-label="Install app"
        onClick={clickHandler}
      >
        <AppIcon icon={faDownload} />
      </button>
      {hintOpen ? <PwaInstallHint onClose={() => setHintOpen(false)} /> : null}
    </>
  );
};

export default PwaInstallButton;
