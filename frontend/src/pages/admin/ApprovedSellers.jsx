import { useEffect, useState } from "react";
import { Loader2, Store } from "lucide-react";
import api from "../../services/adminApi";

export default function ApprovedSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSellers();
  }, []);

  async function loadSellers() {
    setLoading(true);
    try {
      const res = await api.get("/admin/sellers/approved");
      setSellers(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={22} className="animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Store size={20} className="text-brand-600" />
        Approved Sellers
      </h1>

      {sellers.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-16">No approved sellers yet.</p>
      ) : (
        <div className="border rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Restaurant Name</th>
                <th className="text-left px-4 py-3">Owner</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sellers.map((s) => (
                <tr key={s._id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.shopname}</td>
                  <td className="px-4 py-3 text-gray-600">{s.userId?.name || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{s.userId?.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{s.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}