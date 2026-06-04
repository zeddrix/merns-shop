import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Table, Row, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { listProductDetails, updateProduct, productUpdateReset } from '../features/productSlice';
import type { ProductVariant } from '../types';
import SeoPrivateMeta from '../components/SeoPrivateMeta';

const ProductEditScreen = () => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [subcategory, setSubcategory] = useState('');
  const [modelKey, setModelKey] = useState('');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear());
  const [condition, setCondition] = useState('Like New');
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const dispatch = useAppDispatch();

  const productDetails = useAppSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  const productUpdate = useAppSelector((state) => state.productUpdate);
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = productUpdate;

  useEffect(() => {
    if (successUpdate) {
      dispatch(productUpdateReset());
      navigate('/admin/productlist');
    } else if (productId && (!product.name || product._id !== productId)) {
      dispatch(listProductDetails(productId));
    } else if (product._id === productId) {
      setName(product.name);
      setImage(product.image);
      setBrand(product.brand);
      setCategory(product.category);
      setSubcategory(product.subcategory);
      setModelKey(product.modelKey);
      setReleaseYear(product.releaseYear);
      setCondition(product.condition);
      setDescription(product.description);
      setVariants(product.variants);
    }
  }, [dispatch, navigate, productId, product, successUpdate]);

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const addVariant = () => {
    const suffix = `new-${variants.length + 1}`;
    setVariants((prev) => [
      ...prev,
      {
        sku: `${modelKey || 'product'}-${suffix}`,
        label: 'New variant',
        listPrice: 99,
        price: 69,
        countInStock: 0
      }
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    dispatch(
      updateProduct({
        _id: productId,
        name,
        image,
        brand,
        category,
        subcategory,
        modelKey,
        releaseYear,
        condition,
        description,
        variants,
        reviews: product.reviews,
        rating: product.rating,
        numReviews: product.numReviews,
        user: product.user
      })
    );
  };

  const editCanonicalPath = productId ? `/admin/product/${productId}/edit` : '/admin/productlist';

  return (
    <div data-testid="admin-product-edit">
      <SeoPrivateMeta canonicalPath={editCanonicalPath} />
      <Link
        to="/admin/productlist"
        className="btn btn-light my-3"
        data-testid="admin-product-edit-back"
      >
        Go Back
      </Link>
      <FormContainer>
        <h1>Edit Product</h1>
        {loadingUpdate && <Loader />}
        {errorUpdate && <Message variant="danger">{errorUpdate}</Message>}
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <Form onSubmit={submitHandler} data-testid="admin-product-edit-form">
            <Form.Group controlId="name" className="my-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                data-testid="admin-product-name"
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="image" className="my-2">
              <Form.Label>Image path</Form.Label>
              <Form.Control
                type="text"
                value={image}
                data-testid="admin-product-image"
                onChange={(e) => setImage(e.target.value)}
              />
              <Form.Text className="text-muted">
                Use a bundled path under /images/catalog/ (see frontend/public/images/catalog).
              </Form.Text>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group controlId="brand" className="my-2">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    type="text"
                    value={brand}
                    data-testid="admin-product-brand"
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="modelKey" className="my-2">
                  <Form.Label>Model key</Form.Label>
                  <Form.Control
                    type="text"
                    value={modelKey}
                    data-testid="admin-product-model-key"
                    onChange={(e) => setModelKey(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group controlId="category" className="my-2">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    value={category}
                    data-testid="admin-product-category"
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="subcategory" className="my-2">
                  <Form.Label>Subcategory</Form.Label>
                  <Form.Control
                    type="text"
                    value={subcategory}
                    data-testid="admin-product-subcategory"
                    onChange={(e) => setSubcategory(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="releaseYear" className="my-2">
                  <Form.Label>Release year</Form.Label>
                  <Form.Control
                    type="number"
                    value={releaseYear}
                    data-testid="admin-product-release-year"
                    onChange={(e) => setReleaseYear(Number(e.target.value))}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="description" className="my-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                data-testid="admin-product-description"
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <h4 className="mt-3">Variants</h4>
            <div className="table-responsive">
              <Table
                striped
                bordered
                size="sm"
                className="admin-product-variants-table"
                data-testid="admin-product-variants"
              >
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Label</th>
                    <th>List $</th>
                    <th>Sale $</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant, index) => (
                    <tr key={variant.sku} data-testid={`admin-variant-row-${index}`}>
                      <td>
                        <Form.Control
                          size="sm"
                          value={variant.sku}
                          data-testid={`admin-variant-sku-${index}`}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          value={variant.label}
                          data-testid={`admin-variant-label-${index}`}
                          onChange={(e) => updateVariant(index, 'label', e.target.value)}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={variant.listPrice}
                          data-testid={`admin-variant-list-price-${index}`}
                          onChange={(e) =>
                            updateVariant(index, 'listPrice', Number(e.target.value))
                          }
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={variant.price}
                          data-testid={`admin-variant-price-${index}`}
                          onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={variant.countInStock}
                          data-testid={`admin-variant-stock-${index}`}
                          onChange={(e) =>
                            updateVariant(index, 'countInStock', Number(e.target.value))
                          }
                        />
                      </td>
                      <td>
                        <Button
                          variant="light"
                          size="sm"
                          type="button"
                          disabled={variants.length <= 1}
                          onClick={() => removeVariant(index)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <Button type="button" variant="secondary" className="mb-3" onClick={addVariant}>
              Add variant
            </Button>

            <Button type="submit" variant="primary" data-testid="admin-product-submit">
              Update
            </Button>
          </Form>
        )}
      </FormContainer>
    </div>
  );
};

export default ProductEditScreen;
