import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import api from "../../services/axios";
import Pagination from "../../components/Pagination";

const TABS = [
  { key: "all", label: "All" },
  { key: "confirmed", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES = {
  pending: "text-gray-600 bg-gray-100",
  confirmed: "text-amber-700 bg-amber-50",
  shipped: "text-blue-700 bg-blue-50",
  delivered: "text-green-700 bg-green-50",
  cancelled: "text-red-700 bg-red-50",
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// GET /order/my-orders -> { success, orders }  (note: key is `orders`, not `data`)
export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tab]);

  // switching tabs re-fetches page 1 with that status filter applied
  // server-side (see getMyOrders) — not a client-side filter, so counts
  // and pagination stay correct per tab.
  function handleTabChange(nextTab) {
    setTab(nextTab);
    setPage(1);
  }

  async function fetchOrders() {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/order/my-orders", { params: { page, limit: 10, status: tab } });
      setOrders(Array.isArray(res.data?.orders) ? res.data.orders : []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      <div className="flex gap-5 border-b mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`pb-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
              tab === t.key ? "border-brand-600 text-brand-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-gray-500 py-16">Something went wrong while loading your orders.</p>
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderRow key={order._id} order={order} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}

function OrderRow({ order }) {
  const firstItem = order.items?.[0];
  const product = firstItem?.productId;
  const extraCount = (order.items?.length || 1) - 1;

  return (
    <Link
      to={`/orders/${order._id}`}
      className="flex items-center gap-4 border rounded-2xl p-4 hover:border-brand-300 transition-colors"
    >
      <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
        {product?.thumbnailImage ? (
          <img src={product.thumbnailImage} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <Package className="text-gray-300" size={24} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400">Order #{order._id?.slice(-8).toUpperCase()}</p>
        <p className="text-sm font-medium text-gray-900 line-clamp-1">
          {product?.name || "Item"}
          {extraCount > 0 && <span className="text-gray-400"> +{extraCount} more</span>}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="font-semibold text-gray-900">₹{order.totalAmount}</p>
        <span
          className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
            STATUS_STYLES[order.orderStatus] || "text-gray-600 bg-gray-100"
          }`}
        >
          {STATUS_LABELS[order.orderStatus] || order.orderStatus}
        </span>
      </div>
    </Link>
  );
}

function EmptyOrders() {
  return (
    <div className="text-center py-20">
      <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
        <Package className="text-brand-600" size={24} />
      </div>
      <p className="text-gray-500 mb-4">No orders here yet.</p>
      <Link to="/" className="text-brand-600 font-medium hover:underline">
        Browse Restaurants
      </Link>
    </div>
  );
}