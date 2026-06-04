import { Alert } from 'react-bootstrap';

interface MessageProps {
  variant?: string;
  children: React.ReactNode;
  'data-testid'?: string;
}

const Message = ({
  variant = 'info',
  children,
  'data-testid': testId = 'alert-message'
}: MessageProps) => {
  return (
    <Alert variant={variant} data-testid={testId} className="message-fade-in">
      {children}
    </Alert>
  );
};

export default Message;
