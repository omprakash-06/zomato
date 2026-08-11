import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, PackageCheck } from "lucide-react";

// verifyPayment can create MULTIPLE orders in one payment (grouped seller-wise),
// so `orders` here is always an array — even when it's just 1 order.
export default function OrderSuccessPage() {
  const { state } = useLocation();
  const orders = state?.orders || [];

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <p className="text-gray-500 mb-4">No recent order found.</p>
        <Link to="/orders" className="text-brand-600 font-medium hover:underline">
          Go to My Orders
        </Link>
      </div>
    );
  }

  const totalPaid = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const paymentId = orders[0]?.razorpay_payment_id;

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="text-green-600" size={32} />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Payment Successful!</h1>
      <p className="text-sm text-gray-500 mb-8">Your order has been placed successfully.</p>

      <div className="space-y-3 text-left">
        {orders.map((order) => (
          <div key={order._id} className="border rounded-2xl p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Order ID</span>
              <span className="font-medium text-gray-900">#{order._id?.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Items</span>
              <span className="font-medium text-gray-900">{order.items?.length || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium text-gray-900">₹{order.totalAmount}</span>
            </div>
            <Link
              to={`/orders/${order._id}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 mt-3"
            >
              <PackageCheck size={14} />
              View Order Details
            </Link>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-sm border-t mt-5 pt-4 px-1">
        <span className="text-gray-500">Payment ID</span>
        <span className="font-medium text-gray-900">{paymentId}</span>
      </div>
      <div className="flex justify-between font-semibold text-gray-900 mt-2 px-1">
        <span>Total Paid</span>
        <span>₹{totalPaid.toLocaleString()}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link
          to="/orders"
          className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl"
        >
          View My Orders
        </Link>
        <Link
          to="/"
          className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl"
        >
          Continue Ordering
        </Link>
      </div>
    </div>
  );
}