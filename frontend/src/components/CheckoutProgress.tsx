interface CheckoutProgressProps {
  activeStep: 1 | 2;
}

const CheckoutProgress = ({ activeStep }: CheckoutProgressProps) => {
  return (
    <nav
      className="checkout-progress mb-4"
      aria-label="Checkout progress"
      data-testid="checkout-progress"
    >
      <ol className="checkout-progress__list">
        <li
          className={`checkout-progress__step${activeStep === 1 ? ' checkout-progress__step--active' : activeStep > 1 ? ' checkout-progress__step--complete' : ''}`}
          data-testid="checkout-progress-order-details"
        >
          Order Details
        </li>
        <li className="checkout-progress__divider" aria-hidden="true" />
        <li
          className={`checkout-progress__step${activeStep === 2 ? ' checkout-progress__step--active' : ''}`}
          data-testid="checkout-progress-payment"
        >
          Payment
        </li>
      </ol>
    </nav>
  );
};

export default CheckoutProgress;
