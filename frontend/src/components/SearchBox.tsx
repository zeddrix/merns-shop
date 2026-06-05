import { useEffect, useRef, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';

interface SearchBoxProps {
  onSubmit?: () => void;
  autoFocus?: boolean;
}

const SearchBox = ({ onSubmit, autoFocus = false }: SearchBoxProps) => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/');
    }
    onSubmit?.();
  };

  return (
    <Form onSubmit={submitHandler} className="site-search d-flex flex-grow-1">
      <Form.Control
        ref={inputRef}
        type="search"
        name="q"
        data-testid="search-input"
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search products"
        className="site-search-input"
        aria-label="Search products"
      />
      <Button type="submit" className="site-search-submit touch-target" data-testid="search-submit">
        <i className="fas fa-search" aria-hidden="true" />
        <span className="visually-hidden">Search</span>
      </Button>
    </Form>
  );
};

export default SearchBox;
