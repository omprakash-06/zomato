import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Tag, ImagePlus } from "lucide-react";
import adminApi from "../../services/adminApi";

const emptyForm = { name: "", commissionPercent: "", icon: null };

export default function AdminCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // category being edited, or null for "new"
  const [form, setForm] = useState(emptyForm);
  const [iconPreview, setIconPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setError(false);
    try {
      const res = await adminApi.get("/category");
      setCategories(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setIconPreview(null);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(category) {
    setEditing(category);
    setForm({ name: category.name, commissionPercent: category.commissionPercent, icon: null });
    setIconPreview(category.image || null);
    setFormError("");
    setShowForm(true);
  }

  function handleIconChange(file) {
    setForm((f) => ({ ...f, icon: file }));
    setIconPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim() || form.commissionPercent === "") {
      setFormError("Name and commission % are required.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("commissionPercent", Number(form.commissionPercent));
      if (form.icon) formData.append("icon", form.icon);

      if (editing) {
        const res = await adminApi.put(`/category/${editing._id}`, formData);
        const updated = res.data?.data;
        setCategories((prev) => prev.map((c) => (c._id === editing._id ? updated : c)));
      } else {
        const res = await adminApi.post("/category", formData);
        const created = res.data?.data;
        setCategories((prev) => [...prev, created]);
      }
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this category? Products in it may be affected.")) return;
    setDeletingId(id);
    try {
      await adminApi.delete(`/category/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Categories & Commission</h1>
          <p className="text-sm text-gray-500">Manage product categories and their commission rates.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-gray-500 py-16">Something went wrong while loading categories.</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No categories yet. Add one to get started.</p>
      ) : (
        <div className="border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Commission (%)</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((category) => (
                <tr key={category._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                        {category.image ? (
                          <img src={category.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Tag size={14} className="text-gray-400" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{category.commissionPercent}%</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(category)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        disabled={deletingId === category._id}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === category._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">{editing ? "Edit Category" : "Add Category"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Icon upload */}
              <div className="flex items-center gap-4">
                <label className="w-16 h-16 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 hover:border-brand-400 flex items-center justify-center overflow-hidden cursor-pointer shrink-0">
                  {iconPreview ? (
                    <img src={iconPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus size={20} className="text-gray-400" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleIconChange(e.target.files[0] || null)}
                  />
                </label>
                <p className="text-xs text-gray-500">Click the circle to upload an icon (optional).</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.commissionPercent}
                  onChange={(e) => setForm((f) => ({ ...f, commissionPercent: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                />
              </div>

              {formError && <p className="text-sm text-red-600">{formError}</p>}

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}