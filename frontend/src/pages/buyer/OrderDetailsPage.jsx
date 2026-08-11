import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, MapPin, CheckCircle2,Truck, Home, XCircle, Loader2 } from "lucide-react";
import api from "../../services/axios";
import ReviewForm from "../../components/food/ReviewForm";

const TIMELINE_STEPS = [
  { key: "confirmed", label: "Placed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

// GET /order/:id -> { success, order }  (note: key is `order`, not `data`)
// PATCH /order/:id/cancel
export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [reviewState, setReviewState] = useState(null); // { canReview, alreadyReviewed }

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchOrder() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/order/${id}`);
      const fetchedOrder = res.data?.order || null;
      setOrder(fetchedOrder);

      if (fetchedOrder?.orderStatus === "delivered") {
        try {
          const rres = await api.get(`/review/can-review/${id}`);
          setReviewState(rres.data);
        } catch {
          setReviewState(null);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Couldn't load this order.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      await api.patch(`/order/${id}/cancel`);
      fetchOrder();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Could not cancel this order.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-100 rounded-2xl" />
        <div className="h-48 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">{error || "Order not found."}</p>
        <Link to="/orders" className="text-brand-600 font-medium hover:underline">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.orderStatus === "cancelled";
  // NOTE: backend's cancelOrder only allows cancelling when orderStatus === "pending",
  // but online-paid orders start at "confirmed" — so this button may currently
  // always fail for paid orders until that backend rule is relaxed.
  const canCancel = order.orderStatus === "pending";
  const currentStepIndex = TIMELINE_STEPS.findIndex((s) => s.key === order.orderStatus || (s.key === "confirmed" && order.orderStatus === "confirmed"));

  return (
    <section className="max-w-3xl mx-auto px-4 py-6 md:py-8">
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 mb-4">
        <ChevronLeft size={15} />
        Back to My Orders
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-2 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order #{order._id?.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
          >
            {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Cancel Order
          </button>
        )}
      </div>

      {/* Tracking timeline */}
      {!isCancelled ? (
        <div className="border rounded-2xl p-5 mb-6">
          <div className="flex items-center">
            {TIMELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = i <= currentStepIndex;
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        done ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className={`text-xs font-medium ${done ? "text-gray-900" : "text-gray-400"}`}>{step.label}</span>
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < currentStepIndex ? "bg-brand-600" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border border-red-200 bg-red-50/50 rounded-2xl p-4 mb-6 flex items-center gap-2 text-red-600 text-sm font-medium">
          <XCircle size={16} />
          This order was cancelled.
        </div>
      )}

      {/* Items */}
      <div className="border rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Items</h2>
        <div className="divide-y">
          {order.items?.map((item, i) => {
            const product = item.productId || {};
            return (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className="w-14 h-14 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                  {product.thumbnailImage && (
                    <img src={product.thumbnailImage} alt={product.name} className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name || "Product"}</p>
                  <p className="text-xs text-gray-500">
                    {item.size && `Size: ${item.size} · `}Qty: {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900">₹{item.price}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Address + payment */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-brand-600" />
            Delivery Address
          </h2>
          <div className="text-sm text-gray-600 leading-relaxed">
            <p>{order.deliveryAddress?.house}</p>
            <p>{order.deliveryAddress?.street}</p>
            <p>
              {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
            </p>
            <p className="capitalize">{order.deliveryAddress?.country}</p>
          </div>
        </div>

        <div className="border rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Payment Method</span>
              <span className="uppercase text-gray-900 font-medium">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Payment Status</span>
              <span className="capitalize text-gray-900 font-medium">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 border-t pt-2 mt-1">
              <span>Total Amount</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review — only shown once order is delivered */}
      {order.orderStatus === "delivered" && reviewState && (
        <div className="mt-6">
          {reviewState.alreadyReviewed ? (
            <p className="text-sm text-gray-400 text-center">You've already reviewed this order. Thanks!</p>
          ) : reviewState.canReview ? (
            <ReviewForm orderId={id} onSubmitted={() => setReviewState({ canReview: false, alreadyReviewed: true })} />
          ) : null}
        </div>
      )}
    </section>
  );
}