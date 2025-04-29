import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const PayHereRedirect = () => {
  const { state } = useLocation(); // contains order payload from Checkout
  const formRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Sandbox merchant credentials
  const MERCHANT_ID = "1230207";
  const RETURN_URL = "http://localhost:5173/payment-success";
  const CANCEL_URL = "http://localhost:5173/payment-cancel";
  const NOTIFY_URL = "http://localhost:3003/api/payhere/ipn"; // Optional backend handler

  // ✅ Fallbacks if state is empty
  const total = state?.totalAmount || 0;
  const name = state?.customer?.name || "Guest";
  const email = state?.customer?.email || "test@example.com";
  const phone = state?.customer?.phone || "0700000000";
  const address = state?.deliveryAddress || "No address";
  const orderId = "ORDER_" + Date.now();

  useEffect(() => {
    if (!state) {
      navigate("/cart"); // fallback if no payload
      return;
    }

    if (formRef.current) {
      formRef.current.submit(); // 🚀 Trigger auto-redirect
    }
  }, [state, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-semibold mb-4">Redirecting to Payment Gateway...</h2>
      <p className="text-gray-600 mb-6">Please wait while we prepare your secure PayHere session.</p>

      <form
        ref={formRef}
        method="POST"
        action="https://sandbox.payhere.lk/pay/checkout"
        className="hidden"
      >
        {/* 🔐 Required PayHere Fields */}
        <input type="hidden" name="merchant_id" value={MERCHANT_ID} />
        <input type="hidden" name="return_url" value={RETURN_URL} />
        <input type="hidden" name="cancel_url" value={CANCEL_URL} />
        <input type="hidden" name="notify_url" value={NOTIFY_URL} />

        <input type="hidden" name="order_id" value={orderId} />
        <input type="hidden" name="items" value="Order from Centival" />
        <input type="hidden" name="amount" value={total} />
        <input type="hidden" name="currency" value="LKR" />

        {/* 👤 Customer Info */}
        <input type="hidden" name="first_name" value={name} />
        <input type="hidden" name="last_name" value="Customer" />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="address" value={address} />
        <input type="hidden" name="city" value="Colombo" />
        <input type="hidden" name="country" value="Sri Lanka" />
      </form>

      <p className="text-sm text-gray-500">If you're not redirected, please check your internet connection.</p>
    </div>
  );
};

export default PayHereRedirect;
