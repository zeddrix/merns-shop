import { Spinner } from 'react-bootstrap';

interface LoaderProps {
  testId?: string;
}

const Loader = ({ testId = 'page-loader' }: LoaderProps) => {
  return (
    <Spinner
      animation="border"
      role="status"
      data-testid={testId}
      className="loader-fade-in"
      style={{
        width: '100px',
        height: '100px',
        margin: 'auto',
        display: 'block'
      }}
    >
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
};

export default Loader;
