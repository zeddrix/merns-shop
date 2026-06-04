import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';

const SearchBox = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword.trim()}`);
    } else {
      navigate('/');
    }
  };

  return (
    <Form onSubmit={submitHandler} className="d-flex w-100 flex-grow-1">
      <Form.Control
        type="text"
        name="q"
        data-testid="search-input"
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search Products"
        className="me-2"
      />
      <Button
        type="submit"
        variant="outline-success"
        className="p-2 flex-shrink-0 touch-target"
        data-testid="search-submit"
      >
        Search
      </Button>
    </Form>
  );
};

export default SearchBox;
