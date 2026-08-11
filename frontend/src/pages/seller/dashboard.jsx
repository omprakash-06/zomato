import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  ShoppingBag,
  Package,
  FileText,
  Pencil,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import api from "../../services/axios";

const STATUS_STYLES = {
  pending: "text-amber-700 bg-amber-50",
  confirmed: "text-blue-700 bg-blue-50",
  shipped: "text-blue-700 bg-blue-50",
  delivered: "text-green-700 bg-green-50",
  cancelled: "text-red-700 bg-red-50",
};

/**
 * Uses:
 *   GET /seller/dashboard-stats  -> { data: { earnings, ordersCount, productsCount } }
 *   GET /seller/profile          -> { data: seller }  (adjust key below if it differs)
 *   GET /product/my-products     -> { data: [products] }
 *   GET /seller/orders           -> { orders: [orders] }
 *
 * Intentionally left out (no backend support yet, per discussion):
 *   Store Views, Shop Rating/Reviews, per-document labels (Aadhaar/PAN),
 *   earnings breakdown, earnings trend chart, "% vs last month".
 */
export default function SellerDashboard() {
  const [seller, setSeller] = useState(null);
  const [stats, setStats] = useState({ earnings: 0, ordersCount: 0, productsCount: 0 });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [statsRes, profileRes, productsRes, ordersRes] = await Promise.all([
        api.get("/seller/dashboard-stats"),
        api.get("/seller/profile"),
        api.get("/product/my-products"),
        api.get("/seller/orders"),
      ]);

      setStats(statsRes.data?.data || { earnings: 0, ordersCount: 0, productsCount: 0 });
      setSeller(profileRes.data?.data || profileRes.data?.seller || null);
      setProducts(Array.isArray(productsRes.data?.data) ? productsRes.data.data.slice(0, 4) : []);
      setOrders(Array.isArray(ordersRes.data?.orders) ? ordersRes.data.orders.slice(0, 5) : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Welcome back, {seller?.userId?.name?.split(" ")[0] || "Seller"}! 👋
          </h1>
          <p className="text-sm text-gray-500">Here's what's happening with your shop today.</p>
        </div>
        <Link
          to="/seller/shop"
          className="border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 px-4 py-2 rounded-lg"
        >
          View My Restaurant
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={<Wallet size={20} />} label="Total Earnings" value={`₹${(stats.earnings || 0).toLocaleString()}`} iconBg="bg-green-50 text-green-600" />
        <StatCard icon={<ShoppingBag size={20} />} label="Orders" value={stats.ordersCount} iconBg="bg-brand-50 text-brand-600" />
        <StatCard icon={<Package size={20} />} label="Menu Items" value={stats.productsCount} iconBg="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Shop Profile */}
        <div className="border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Restaurant Profile</h2>
            <Link to="/seller/shop-settings" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              <Pencil size={13} />
              Edit
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold text-lg">
              {seller?.shopname?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900">{seller?.shopname}</p>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    seller?.status === "approved"
                      ? "text-green-700 bg-green-50"
                      : seller?.status === "reject"
                      ? "text-red-700 bg-red-50"
                      : "text-amber-700 bg-amber-50"
                  }`}
                >
                  {seller?.status === "approved" ? "Verified" : seller?.status === "reject" ? "Rejected" : "Pending"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <Row label="Seller Name" value={seller?.userId?.name} />
            <Row label="Email" value={seller?.userId?.email} />
            <Row label="Phone" value={seller?.phone} />
            <Row
              label="Address"
              value={
                seller?.address
                  ? `${seller.address.house}, ${seller.address.street}, ${seller.address.state} - ${seller.address.pincode}`
                  : "—"
              }
            />
          </div>
        </div>

        {/* Documents */}
        <div className="border rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Documents</h2>
          {Array.isArray(seller?.documents) && seller.documents.length > 0 ? (
            <div className="space-y-3">
              {seller.documents.map((doc, i) => (
                <a
                  key={i}
                  href={doc}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 border rounded-xl p-3 hover:border-brand-300"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-gray-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 flex-1">Document {i + 1}</span>
                  <ArrowUpRight size={14} className="text-gray-400" />
                </a>
              ))}
              <p className="text-xs text-gray-400 pt-1">
                Overall verification status: <span className="font-medium capitalize">{seller?.status}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No documents uploaded.</p>
          )}
        </div>
      </div>

      {/* My Products */}
      <div className="border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Menu Highlights</h2>
          <div className="flex items-center gap-3">
            <Link to="/seller/menu" state={{ create: true }} className="border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 px-4 py-2 rounded-lg">
              Add New Item
            </Link>
            <Link to="/seller/menu" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
              View Full Menu
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No menu items yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium">Stock</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p._id}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                          {p.thumbnailImage && <img src={p.thumbnailImage} alt={p.name} className="w-full h-full object-contain" />}
                        </div>
                        <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-700">₹{p.actualPrice ?? p.price}</td>
                    <td className="py-3 text-gray-700">{p.stock}</td>
                    <td className="py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.status === "active" ? "text-green-700 bg-green-50" : "text-gray-600 bg-gray-100"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link to="/seller/menu" state={{ editId: p._id }} className="text-gray-500 hover:text-brand-600">
                          <Pencil size={15} />
                        </Link>
                        <button className="text-gray-500 hover:text-red-500">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/seller/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View All Orders
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-sm text-gray-500 py-6 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">Order ID</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td className="py-3 font-medium text-gray-900">#{o._id?.slice(-6).toUpperCase()}</td>
                    <td className="py-3 text-gray-700">{o.buyerId?.name || "—"}</td>
                    <td className="py-3 text-gray-700">₹{o.totalAmount}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[o.orderStatus] || "text-gray-600 bg-gray-100"}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, iconBg }) {
  return (
    <div className="border rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-3">
      <span className="w-24 text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-800">{value || "—"}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded" />
      <div className="grid sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-56 rounded-2xl bg-gray-100" />
        <div className="h-56 rounded-2xl bg-gray-100" />
      </div>
      <div className="h-64 rounded-2xl bg-gray-100" />
    </div>
  );
}