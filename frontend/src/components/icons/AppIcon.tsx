import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { CSSProperties } from 'react';

interface AppIconProps {
  icon: IconDefinition;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

const AppIcon = ({ icon, className, style, title }: AppIconProps) => (
  <FontAwesomeIcon
    icon={icon}
    className={className}
    style={style}
    title={title}
    aria-hidden={!title}
  />
);

export default AppIcon;
