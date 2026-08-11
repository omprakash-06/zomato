import { useEffect, useState } from "react";
import { Check, X, FileText, Loader2 } from "lucide-react";
import api from "../../services/adminApi";

export default function AdminSellerApplication() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/admin/sellers/pending");
      setSellers(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    setActingId(id);
    try {
      await api.put(`/admin/seller/${id}/approve`);
      setSellers((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to approve seller.");
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(id) {
    const reason = window.prompt("Reason for rejection (shown to the seller):");
    if (reason === null) return; // cancelled
    setActingId(id);
    try {
      await api.put(`/admin/seller/${id}/reject`, { reason });
      setSellers((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to reject seller.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Pending Restaurant Applications</h1>
        <p className="text-sm text-gray-500">Review and approve or reject new restaurant applications.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-gray-500 py-16">Something went wrong while loading applications.</p>
      ) : sellers.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No pending applications right now.</p>
      ) : (
        <div className="border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Restaurant</th>
                <th className="px-4 py-3 font-medium">Restaurant Name</th>
                <th className="px-4 py-3 font-medium">Applied On</th>
                <th className="px-4 py-3 font-medium">Documents</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sellers.map((seller) => {
                const busy = actingId === seller._id;
                return (
                  <tr key={seller._id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                          {seller.userId?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{seller.userId?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{seller.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{seller.shopname}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(seller.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {Array.isArray(seller.documents) && seller.documents.length > 0 ? (
                          seller.documents.map((doc, i) => (
                            <a
                              key={i}
                              href={doc}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
                            >
                              <FileText size={12} />
                              Doc {i + 1}
                            </a>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(seller._id)}
                          disabled={busy}
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50"
                        >
                          {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button
                          onClick={() => handleReject(seller._id)}
                          disabled={busy}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}