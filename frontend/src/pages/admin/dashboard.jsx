import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Tag, ArrowRight, IndianRupee, Users, ShoppingBag } from "lucide-react";
import api from "../../services/adminApi";
import { useAdmin } from "../../context/adminContext";

export default function AdminDashboard() {
  const { admin } = useAdmin();
  const [pendingCount, setPendingCount] = useState(null);
  const [approvedCount, setApprovedCount] = useState(null);
  const [categoryCount, setCategoryCount] = useState(null);
  const [orderCount, setOrderCount] = useState(null);

  useEffect(() => {
    loadCounts();
  }, []);

  async function loadCounts() {
    try {
      const [sellersRes, approvedRes, categoriesRes, ordersRes] = await Promise.all([
        api.get("/admin/sellers/pending"),
        api.get("/admin/sellers/approved"),
        api.get("/category"),
        api.get("/admin/orders?limit=1"),
      ]);
      setPendingCount(Array.isArray(sellersRes.data?.data) ? sellersRes.data.data.length : 0);
      setApprovedCount(Array.isArray(approvedRes.data?.data) ? approvedRes.data.data.length : 0);
      setCategoryCount(Array.isArray(categoriesRes.data?.data) ? categoriesRes.data.data.length : 0);
      setOrderCount(ordersRes.data?.total ?? 0);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Welcome back, {admin?.name || "Admin"}! 👋
        </h1>
        <p className="text-sm text-gray-500">Here's a quick overview of what needs your attention.</p>
      </div>

      {/* Earnings banner */}
      <div className="rounded-2xl p-6 bg-linear-to-r from-brand-600 to-brand-500 text-white flex items-center justify-between">
        <div>
          <p className="text-sm text-brand-100">Total Earnings</p>
          <p className="text-3xl font-bold mt-1">
            ₹{(admin?.earnings ?? 0).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center">
          <IndianRupee size={26} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/seller/application"
          className="border rounded-2xl p-5 flex items-center gap-4 hover:border-brand-300 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">Pending Applications</p>
            <p className="text-2xl font-bold text-gray-900">{pendingCount ?? "—"}</p>
          </div>
          <ArrowRight size={18} className="text-gray-400 shrink-0" />
        </Link>

        <Link
          to="/admin/approved/sellers"
          className="border rounded-2xl p-5 flex items-center gap-4 hover:border-brand-300 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">Approved Sellers</p>
            <p className="text-2xl font-bold text-gray-900">{approvedCount ?? "—"}</p>
          </div>
          <ArrowRight size={18} className="text-gray-400 shrink-0" />
        </Link>

        <Link
          to="/admin/orders"
          className="border rounded-2xl p-5 flex items-center gap-4 hover:border-brand-300 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orderCount ?? "—"}</p>
          </div>
          <ArrowRight size={18} className="text-gray-400 shrink-0" />
        </Link>

        <Link
          to="/admin/category"
          className="border rounded-2xl p-5 flex items-center gap-4 hover:border-brand-300 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Tag size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-gray-900">{categoryCount ?? "—"}</p>
          </div>
          <ArrowRight size={18} className="text-gray-400 shrink-0" />
        </Link>
      </div>
    </div>
  );
}