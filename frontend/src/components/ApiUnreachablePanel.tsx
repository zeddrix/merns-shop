import { Alert, Button } from 'react-bootstrap';
import { API_UNREACHABLE_MESSAGE } from '../utils/getErrorMessage';

interface ApiUnreachablePanelProps {
  onRetry: () => void;
  'data-testid'?: string;
}

const ApiUnreachablePanel = ({
  onRetry,
  'data-testid': testId = 'api-unreachable-message'
}: ApiUnreachablePanelProps) => {
  return (
    <Alert variant="danger" data-testid={testId} className="message-fade-in">
      <p className="mb-2">{API_UNREACHABLE_MESSAGE}</p>
      {import.meta.env.DEV ? (
        <p className="mb-2 text-muted small">
          Run <code>pnpm dev</code> from the project root to start the API and frontend.
        </p>
      ) : null}
      <Button
        variant="outline-danger"
        size="sm"
        onClick={onRetry}
        data-testid="api-unreachable-retry"
      >
        Retry
      </Button>
    </Alert>
  );
};

export default ApiUnreachablePanel;
