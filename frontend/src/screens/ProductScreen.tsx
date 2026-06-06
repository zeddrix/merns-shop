import { useState, useEffect, FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Form, Badge } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import Rating from '../components/Rating';
import Message from '../components/Message';
import ApiUnreachablePanel from '../components/ApiUnreachablePanel';
import Loader from '../components/Loader';
import { isApiUnreachableMessage } from '../utils/getErrorMessage';
import Meta from '../components/Meta';
import PriceDisplay from '../components/PriceDisplay';
import AppSelect from '../components/AppSelect';
import ProductVariantDetails from '../components/ProductVariantDetails';
import {
  buildProductJsonLd,
  buildProductTitle,
  productOgImageUrl,
  truncateDescription
} from '../utils/seoMeta';
import ProductVariantPicker from '../components/ProductVariantPicker';
import AddToCartButton, { type AddToCartButtonState } from '../components/AddToCartButton';
import { capQtyOptions } from '../constants/cartLimits';
import { firstInStockSku } from '../utils/defaultVariant';
import { addToCart } from '../features/cartSlice';
import { useScrollIntoViewOnKeyChange } from '../hooks/useScrollIntoViewOnKeyChange';
import {
  listProductDetails,
  createProductReview,
  productReviewCreateReset
} from '../features/productSlice';

type AddCartButtonState = AddToCartButtonState;

const ProductScreen = () => {
  const { id } = useParams<{ id: string }>();
  const [qty, setQty] = useState(1);
  const [selectedSku, setSelectedSku] = useState('');
  const [addCartState, setAddCartState] = useState<AddCartButtonState>('idle');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const dispatch = useAppDispatch();

  const productDetails = useAppSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

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

  const userInfo = useAppSelector((state) => state.userLogin.userInfo);

  const productContentReady =
    Boolean(id) && !loading && !error && !isApiUnreachableMessage(error) && product._id === id;
  useScrollIntoViewOnKeyChange('product-details', id ?? '', productContentReady);

  useEffect(() => {
    if (successProductReview && id) {
      setRating(0);
      setComment('');
      dispatch(listProductDetails(id));
    }
    if (id && (!product._id || product._id !== id)) {
      dispatch(listProductDetails(id));
      dispatch(productReviewCreateReset());
      setQty(1);
      setAddCartState('idle');
    }
  }, [dispatch, id, successProductReview, product._id]);

  useEffect(() => {
    if (id && userInfo && product._id === id) {
      dispatch(listProductDetails(id));
    }
  }, [dispatch, id, userInfo, product._id]);

  useEffect(() => {
    if (product.variants.length > 0 && product._id === id) {
      const defaultSku = firstInStockSku(product.variants);
      setSelectedSku(defaultSku);
      setQty(1);
      setAddCartState('idle');
    }
  }, [product._id, product.variants, id]);

  useEffect(() => {
    if (addCartState !== 'added') {
      return;
    }
    const timer = window.setTimeout(() => setAddCartState('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [addCartState]);

  useEffect(() => {
    if (addCartState !== 'error') {
      return;
    }
    const timer = window.setTimeout(() => setAddCartState('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [addCartState]);

  const addToCartHandler = async () => {
    if (!id || !selectedSku || !selectedVariant || selectedVariant.countInStock === 0) {
      return;
    }
    setAddCartState('loading');
    try {
      await dispatch(addToCart({ id, qty, variantSku: selectedSku })).unwrap();
      setAddCartState('added');
    } catch {
      setAddCartState('error');
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

  const qtyOptions = [...Array(maxQty).keys()].map((x) => ({
    value: String(x + 1),
    label: String(x + 1)
  }));

  const ratingOptions = [
    { value: '0', label: 'Select...' },
    { value: '1', label: '1 - Poor' },
    { value: '2', label: '2 - Fair' },
    { value: '3', label: '3 - Good' },
    { value: '4', label: '4 - Very Good' },
    { value: '5', label: '5 - Excellent' }
  ];

  return (
    <>
      <Link className="btn btn-light my-3" to="/" data-testid="product-go-back">
        Go Back
      </Link>
      {loading ? (
        <Loader />
      ) : error && isApiUnreachableMessage(error) ? (
        <div data-testid="product-api-unreachable">
          <ApiUnreachablePanel
            onRetry={() => {
              if (id) {
                dispatch(listProductDetails(id));
              }
            }}
          />
        </div>
      ) : error ? (
        <div data-testid="product-not-found">
          <Message variant="danger">{error}</Message>
          <p className="mt-3 mb-0">
            This product may have been removed or the link is out of date after a catalog refresh.
          </p>
          <Link to="/" className="btn btn-primary mt-3" data-testid="product-not-found-browse">
            Browse catalog
          </Link>
        </div>
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
            <Col xs={12} lg={6}>
              <Image src={displayImage} alt={product.name} fluid className="rounded" />
            </Col>
            <Col xs={12} lg={3}>
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
                <ListGroup.Item>
                  <span className="product-description-clamp">{product.description}</span>
                </ListGroup.Item>
                {selectedVariant && (
                  <ListGroup.Item>
                    <ProductVariantDetails product={product} variant={selectedVariant} />
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Col>
            <Col xs={12} lg={3}>
              <Card className="product-buy-card sticky-lg-top">
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <ProductVariantPicker
                      variants={product.variants}
                      selectedSku={selectedSku}
                      onSelect={(sku) => {
                        setSelectedSku(sku);
                        setQty(1);
                      }}
                    />
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
                          <AppSelect
                            value={qty}
                            data-testid="product-qty"
                            onChange={(value) => setQty(Number(value))}
                            options={qtyOptions}
                          />
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}

                  <ListGroup.Item>
                    <AddToCartButton
                      state={addCartState}
                      onClick={addToCartHandler}
                      disabled={
                        allVariantsOutOfStock ||
                        (selectedVariant !== undefined && selectedVariant.countInStock === 0)
                      }
                    />
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xs={12} lg={6}>
              <h2>Reviews</h2>
              {product.reviews.length === 0 && <Message>No Reviews</Message>}
              <ListGroup variant="flush">
                {product.reviews.map((review) => (
                  <ListGroup.Item key={review._id} data-testid="review-item">
                    <strong>{review.name}</strong>
                    <Rating value={review.rating} />
                    <p>{review.createdAt.substring(0, 10)}</p>
                    <p>{review.comment}</p>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              {(successProductReview || errorProductReview || product.canReview) && (
                <div className="mt-4">
                  <h2>Write a Customer Review</h2>
                  {successProductReview && (
                    <Message variant="success">Review submitted successfully</Message>
                  )}
                  {loadingProductReview && <Loader />}
                  {errorProductReview && <Message variant="danger">{errorProductReview}</Message>}
                  {product.canReview && (
                    <Form onSubmit={submitHandler} data-testid="review-form">
                      <Form.Group controlId="rating" className="mb-3">
                        <Form.Label>Rating</Form.Label>
                        <AppSelect
                          value={rating}
                          data-testid="review-rating"
                          onChange={(value) => setRating(Number(value))}
                          options={ratingOptions}
                        />
                      </Form.Group>
                      <Form.Group controlId="comment" className="mb-3">
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
                  )}
                </div>
              )}
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default ProductScreen;
