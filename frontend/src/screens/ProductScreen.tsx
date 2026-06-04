import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Form, Badge } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Rating from '../components/Rating';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Meta from '../components/Meta';
import PriceDisplay from '../components/PriceDisplay';
import {
  buildProductJsonLd,
  buildProductTitle,
  productOgImageUrl,
  truncateDescription
} from '../utils/seoMeta';
import ProductVariantPicker from '../components/ProductVariantPicker';
import { capQtyOptions } from '../constants/cartLimits';
import {
  listProductDetails,
  createProductReview,
  productReviewCreateReset
} from '../features/productSlice';

const ProductScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [selectedSku, setSelectedSku] = useState('');
  const [variantError, setVariantError] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const dispatch = useAppDispatch();

  const productDetails = useAppSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  const userInfo = useAppSelector((state) => state.userLogin.userInfo);

  const productReviewCreate = useAppSelector((state) => state.productReviewCreate);
  const {
    success: successProductReview,
    loading: loadingProductReview,
    error: errorProductReview
  } = productReviewCreate;

  const selectedVariant = product.variants.find((v) => v.sku === selectedSku);
  const allVariantsOutOfStock =
    product.variants.length > 0 && product.variants.every((v) => v.countInStock === 0);
  const displayImage = selectedVariant?.image ?? product.image;
  const maxQty = capQtyOptions(selectedVariant?.countInStock ?? 0);

  useEffect(() => {
    if (successProductReview) {
      setRating(0);
      setComment('');
    }
    if (id && (!product._id || product._id !== id)) {
      dispatch(listProductDetails(id));
      dispatch(productReviewCreateReset());
      setSelectedSku('');
      setQty(1);
    }
  }, [dispatch, id, successProductReview, product._id]);

  const addToCartHandler = () => {
    if (!selectedSku) {
      setVariantError(true);
      return;
    }
    if (!selectedVariant || selectedVariant.countInStock === 0) {
      return;
    }
    setVariantError(false);
    if (id) {
      navigate(`/cart/${id}?qty=${qty}&variantSku=${encodeURIComponent(selectedSku)}`);
    }
  };

  const submitHandler = (e: FormEvent) => {
    e.preventDefault();
    if (id) {
      dispatch(
        createProductReview({
          productId: id,
          review: { rating, comment }
        })
      );
    }
  };

  return (
    <>
      <Link className="btn btn-light my-3" to="/" data-testid="product-go-back">
        Go Back
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Meta
            title={buildProductTitle(product.name)}
            description={truncateDescription(product.description)}
            canonicalPath={`/product/${product._id}`}
            ogImage={productOgImageUrl(product)}
            ogType="product"
            jsonLd={buildProductJsonLd(product)}
          />
          <Row data-testid="product-details">
            <Col md={6}>
              <Image src={displayImage} alt={product.name} fluid />
            </Col>
            <Col md={3}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>{product.name}</h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Badge bg="dark" className="me-1">
                    {product.brand}
                  </Badge>
                  <Badge bg="info" className="me-1">
                    {product.subcategory}
                  </Badge>
                  <Badge bg="secondary">{product.condition}</Badge>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Rating value={product.rating} text={`${product.numReviews} reviews`} />
                </ListGroup.Item>
                {selectedVariant && (
                  <ListGroup.Item>
                    <PriceDisplay
                      price={selectedVariant.price}
                      listPrice={selectedVariant.listPrice}
                      size="lg"
                    />
                  </ListGroup.Item>
                )}
                <ListGroup.Item>Description: {product.description}</ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={3}>
              <Card>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <ProductVariantPicker
                      variants={product.variants}
                      selectedSku={selectedSku}
                      onSelect={(sku) => {
                        setSelectedSku(sku);
                        setVariantError(false);
                        setQty(1);
                      }}
                    />
                    {variantError && (
                      <Message variant="warning" data-testid="product-variant-error">
                        Please select an option before adding to cart.
                      </Message>
                    )}
                  </ListGroup.Item>

                  {selectedVariant && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Status:</Col>
                        <Col>{selectedVariant.countInStock > 0 ? 'In Stock' : 'Out Of Stock'}</Col>
                      </Row>
                    </ListGroup.Item>
                  )}

                  {selectedVariant && selectedVariant.countInStock > 0 && maxQty > 0 && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Qty</Col>
                        <Col>
                          <Form.Select
                            value={qty}
                            data-testid="product-qty"
                            onChange={(e) => setQty(Number(e.target.value))}
                          >
                            {[...Array(maxQty).keys()].map((x) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}

                  <ListGroup.Item>
                    <Button
                      onClick={addToCartHandler}
                      className="btn-block"
                      type="button"
                      data-testid="product-add-cart"
                      disabled={
                        allVariantsOutOfStock ||
                        (selectedVariant !== undefined && selectedVariant.countInStock === 0)
                      }
                    >
                      Add To Cart
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <h2>Reviews</h2>
              {product.reviews.length === 0 && <Message>No Reviews</Message>}
              <ListGroup variant="flush">
                {product.reviews.map((review) => (
                  <ListGroup.Item key={review._id}>
                    <strong>{review.name}</strong>
                    <Rating value={review.rating} />
                    <p>{review.createdAt.substring(0, 10)}</p>
                    <p>{review.comment}</p>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item>
                  <h2>Write a Customer Review</h2>
                  {successProductReview && (
                    <Message variant="success">Review submitted successfully</Message>
                  )}
                  {loadingProductReview && <Loader />}
                  {errorProductReview && <Message variant="danger">{errorProductReview}</Message>}
                  {userInfo ? (
                    <Form onSubmit={submitHandler} data-testid="review-form">
                      <Form.Group controlId="rating">
                        <Form.Label>Rating</Form.Label>
                        <Form.Select
                          value={rating}
                          data-testid="review-rating"
                          onChange={(e) => setRating(Number(e.target.value))}
                        >
                          <option value={0}>Select...</option>
                          <option value={1}>1 - Poor</option>
                          <option value={2}>2 - Fair</option>
                          <option value={3}>3 - Good</option>
                          <option value={4}>4 - Very Good</option>
                          <option value={5}>5 - Excellent</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group controlId="comment">
                        <Form.Label>Comment</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={comment}
                          data-testid="review-comment"
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </Form.Group>
                      <Button
                        disabled={loadingProductReview}
                        type="submit"
                        variant="primary"
                        data-testid="review-submit"
                      >
                        Submit
                      </Button>
                    </Form>
                  ) : (
                    <Message>
                      Please <Link to="/login">sign in</Link> to write a review{' '}
                    </Message>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default ProductScreen;
