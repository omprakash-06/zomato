import { useEffect, useState } from "react";
import { Loader2, Package } from "lucide-react";
import api from "../../services/adminApi";

const STATUS_OPTIONS = ["", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [status, page]);

  async function loadOrders() {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (status) params.status = status;
      const res = await api.get("/admin/orders", { params });
      setOrders(res.data?.orders || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Package size={20} className="text-brand-600" />
          Orders
        </h1>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.filter(Boolean).map((s) => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-brand-600" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-16">No orders found.</p>
      ) : (
        <div className="border rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Order ID</th>
                <th className="text-left px-4 py-3">Buyer</th>
                <th className="text-left px-4 py-3">Restaurant</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-right px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">#{o._id.slice(-6)}</td>
                  <td className="px-4 py-3 text-gray-600">{o.buyerId?.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{o.sellerId?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize inline-flex px-2 py-0.5 rounded-full text-xs bg-brand-50 text-brand-600 font-medium">
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">{o.paymentStatus}</td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}