import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { UtensilsCrossed, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";

const PAGE_SIZE = 12;
import api from "../../services/axios";

const emptyForm = {
  name: "", description: "", category: "",
  price: "", discount: "",
  isVeg: true, isAvailable: true,
  thumbnail: null,
};

export default function SellerMenuPage() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  // Auto-open the create/edit modal when arriving here from the Dashboard's
  // shortcuts, since intent is passed via navigation state.
  useEffect(() => {
    if (!location.state) return;
    if (location.state.create) {
      openCreate();
    } else if (location.state.editId && items.length > 0) {
      const item = items.find((p) => p._id === location.state.editId);
      if (item) openEdit(item);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, items]);

  async function fetchCategories() {
    try {
      const res = await api.get("/category");
      setCategories(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await api.get("/product/my-products", { params: { page: 1, limit: PAGE_SIZE } });
      setItems(res.data?.data || []);
      setPage(1);
      setHasMore(!!res.data?.pagination?.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await api.get("/product/my-products", { params: { page: nextPage, limit: PAGE_SIZE } });
      setItems((prev) => [...prev, ...(res.data?.data || [])]);
      setHasMore(!!res.data?.pagination?.hasMore);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(item) {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      description: item.description || "",
      category: item.category?.name || "",
      price: item.price || "",
      discount: item.discount || "",
      isVeg: item.isVeg !== false,
      isAvailable: item.isAvailable !== false,
      thumbnail: null,
    });
    setError("");
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm("Remove this item from your menu?")) return;
    try {
      await api.delete(`/product/${id}`);
      setItems((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  // Quick toggle straight from the card
  async function handleToggleAvailable(item) {
    const nextAvailable = !item.isAvailable;
    setItems((prev) => prev.map((p) => (p._id === item._id ? { ...p, isAvailable: nextAvailable } : p)));
    try {
      const formData = new FormData();
      formData.append("isAvailable", nextAvailable);
      await api.put(`/product/${item._id}`, formData);
    } catch (err) {
      console.error(err);
      setItems((prev) => prev.map((p) => (p._id === item._id ? { ...p, isAvailable: item.isAvailable } : p)));
    }
  }

  async function handleSave() {
    setError("");
    if (!form.name.trim() || !form.description.trim() || !form.category.trim() || !form.price) {
      setError("Name, description, category and price are required.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("category", form.category.trim());
      formData.append("price", form.price);
      formData.append("discount", form.discount || 0);
      formData.append("isVeg", form.isVeg);
      formData.append("isAvailable", form.isAvailable);
      if (form.thumbnail) formData.append("thumbnail", form.thumbnail);

      if (editingId) {
        await api.put(`/product/${editingId}`, formData);
      } else {
        await api.post("/product", formData);
      }

      setShowForm(false);
      fetchItems();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to save item.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <UtensilsCrossed size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No menu items yet. Add your first dish.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item._id}
              className={`border rounded-2xl overflow-hidden bg-white ${!item.isAvailable ? "opacity-60" : ""}`}
            >
              <div className="aspect-square bg-gray-50 relative">
                {item.thumbnailImage && (
                  <img src={item.thumbnailImage} alt={item.name} className="w-full h-full object-cover" />
                )}
                <span className={`absolute top-2 left-2 ${item.isVeg ? "veg-dot" : "nonveg-dot"} bg-white rounded`} />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-gray-900">₹{item.actualPrice ?? item.price}</span>
                  {item.discount > 0 && (
                    <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
                  )}
                </div>

                <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!item.isAvailable}
                    onChange={() => handleToggleAvailable(item)}
                    className="accent-brand-500"
                  />
                  <span className="text-xs text-gray-600">
                    {item.isAvailable ? "Available" : "Out of stock"}
                  </span>
                </label>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium border rounded-lg py-1.5 hover:bg-gray-50"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium border border-red-200 text-red-600 rounded-lg py-1.5 hover:bg-red-50"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-sm font-medium text-gray-700 px-6 py-2.5 rounded-lg"
          >
            {loadingMore && <Loader2 size={16} className="animate-spin" />}
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">{editingId ? "Edit Item" : "Add Item"}</h2>
              <button onClick={() => setShowForm(false)}>
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <TextArea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Price (₹)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
                <Input label="Discount %" type="number" value={form.discount} onChange={(v) => setForm({ ...form, discount: v })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                  <div className="flex gap-3 text-sm">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="isVeg"
                        checked={form.isVeg === true}
                        onChange={() => setForm({ ...form, isVeg: true })}
                        className="accent-green-600"
                      />
                      <span className="veg-dot" /> Veg
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="isVeg"
                        checked={form.isVeg === false}
                        onChange={() => setForm({ ...form, isVeg: false })}
                        className="accent-red-600"
                      />
                      <span className="nonveg-dot" /> Non-Veg
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label>
                  <label className="flex items-center gap-2 cursor-pointer mt-1.5">
                    <input
                      type="checkbox"
                      checked={form.isAvailable}
                      onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                      className="accent-brand-500"
                    />
                    <span className="text-sm text-gray-600">{form.isAvailable ? "Available" : "Out of stock"}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.files[0] })}
                  className="text-sm"
                />
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg mt-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Saving..." : editingId ? "Update Item" : "Create Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500 resize-none"
      />
    </div>
  );
}
