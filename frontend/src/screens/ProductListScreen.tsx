import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import {
  listProducts,
  deleteProduct,
  createProduct,
  productCreateReset
} from '../features/productSlice';
import { useRequireAdmin } from '../hooks/useRequireAdmin';

const ProductListScreen = () => {
  const { pageNumber } = useParams<{ pageNumber?: string }>();
  const page = pageNumber ?? '1';

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const productList = useAppSelector((state) => state.productList);
  const { loading, error, products, page: currentPage, pages } = productList;

  const productDelete = useAppSelector((state) => state.productDelete);
  const { loading: loadingDelete, error: errorDelete, success: successDelete } = productDelete;

  const productCreate = useAppSelector((state) => state.productCreate);
  const {
    loading: loadingCreate,
    error: errorCreate,
    success: successCreate,
    product: createdProduct
  } = productCreate;

  const isAdmin = useRequireAdmin();

  useEffect(() => {
    dispatch(productCreateReset());

    if (!isAdmin) {
      return;
    }

    if (successCreate && createdProduct) {
      navigate(`/admin/product/${createdProduct._id}/edit`);
    } else {
      dispatch(listProducts({ keyword: '', pageNumber: page }));
    }
  }, [dispatch, navigate, isAdmin, successDelete, successCreate, createdProduct, page]);

  const deleteHandler = (id: string) => {
    if (window.confirm('Are you sure')) {
      dispatch(deleteProduct(id));
    }
  };

  const createProductHandler = () => {
    dispatch(createProduct());
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div data-testid="admin-product-list">
      <Row className="align-items-center">
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className="text-end">
          <Button
            className="my-3"
            data-testid="admin-create-product"
            onClick={createProductHandler}
          >
            <i className="fas fa-plus"></i> Create Product
          </Button>
        </Col>
      </Row>
      {loadingDelete && <Loader />}
      {errorDelete && <Message variant="danger">{errorDelete}</Message>}
      {loadingCreate && <Loader />}
      {errorCreate && <Message variant="danger">{errorCreate}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>FROM</th>
                <th>VARIANTS</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} data-testid={`admin-product-${product._id}`}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>${product.priceFrom ?? product.variants[0]?.price ?? 0}</td>
                  <td>{product.variants.length}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <Link
                      to={`/admin/product/${product._id}/edit`}
                      className="btn btn-light btn-sm"
                      data-testid={`admin-product-edit-${product._id}`}
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    <Button
                      variant="danger"
                      className="btn-sm"
                      data-testid={`admin-product-delete-${product._id}`}
                      onClick={() => deleteHandler(product._id)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginate pages={pages ?? 1} page={currentPage ?? 1} isAdmin />
        </>
      )}
    </div>
  );
};

export default ProductListScreen;
