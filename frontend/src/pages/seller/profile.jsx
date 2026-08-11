import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/axios";

export default function SellerShopSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    shopname: "",
    phone: "",
    description: "",
    cuisines: "",
    openingTime: "",
    closingTime: "",
    isOpen: true,
    address: {
      house: "",
      street: "",
      state: "",
      pincode: "",
    },
  });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/seller/profile");

      const seller = res.data.data;

      setForm({
        shopname: seller.shopname || "",
        phone: seller.phone || "",
        description: seller.description || "",
        cuisines: Array.isArray(seller.cuisines) ? seller.cuisines.join(", ") : "",
        openingTime: seller.openingTime || "",
        closingTime: seller.closingTime || "",
        isOpen: seller.isOpen !== false,
        address: {
          house: seller.address?.house || "",
          street: seller.address?.street || "",
          state: seller.address?.state || "",
          pincode: seller.address?.pincode || "",
        },
      });
      setCoverPreview(seller.coverImage || null);
    } catch (err) {
      console.error(err);
      alert("Unable to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");

      setForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("shopname", form.shopname);
      formData.append("phone", form.phone);
      formData.append("description", form.description);
      formData.append("cuisines", form.cuisines);
      formData.append("openingTime", form.openingTime);
      formData.append("closingTime", form.closingTime);
      formData.append("isOpen", form.isOpen);
      formData.append("address", JSON.stringify(form.address));
      if (coverImageFile) formData.append("coverImage", coverImageFile);

      const res = await api.put("/seller/profile", formData);

      alert(res.data.message);

      fetchProfile();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Update Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 size={40} className="animate-spin text-brand-600" />
      </div>
    );
  }  return (
    <div className="max-w-4xl mx-auto p-6">

      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/seller/dashboard"
          className="p-2 rounded-lg border hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Restaurant Settings
          </h1>
          <p className="text-sm text-gray-500">
            Update your restaurant information
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl shadow-sm p-6 space-y-6"
      >
        {/* Cover Image */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Cover Image</h2>
          <div className="flex items-center gap-4">
            <div className="w-32 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
              {coverPreview && <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setCoverImageFile(file);
                if (file) setCoverPreview(URL.createObjectURL(file));
              }}
              className="text-sm"
            />
          </div>
        </div>

        {/* Shop Info */}

        <div>
          <h2 className="text-lg font-semibold mb-4">
            Restaurant Information
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium mb-2">
                Restaurant Name
              </label>

              <input
                type="text"
                name="shopname"
                value={form.shopname}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Restaurant Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Phone Number"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                placeholder="Tell customers about your restaurant..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Cuisines (comma separated)</label>
              <input
                type="text"
                name="cuisines"
                value={form.cuisines}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="North Indian, Chinese, Desserts"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Opening Time</label>
              <input
                type="time"
                name="openingTime"
                value={form.openingTime}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Closing Time</label>
              <input
                type="time"
                name="closingTime"
                value={form.closingTime}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isOpen}
                  onChange={(e) => setForm((prev) => ({ ...prev, isOpen: e.target.checked }))}
                  className="accent-brand-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Restaurant is currently open
                </span>
              </label>
            </div>

          </div>
        </div>

        {/* Address */}

        <div>
          <h2 className="text-lg font-semibold mb-4">
            Address
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium mb-2">
                House
              </label>

              <input
                type="text"
                name="address.house"
                value={form.address.house}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                placeholder="House No."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Street
              </label>

              <input
                type="text"
                name="address.street"
                value={form.address.street}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                placeholder="Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                State
              </label>

              <input
                type="text"
                name="address.state"
                value={form.address.state}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                placeholder="State"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Pincode
              </label>

              <input
                type="text"
                name="address.pincode"
                value={form.address.pincode}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                placeholder="Pincode"
              />
            </div>

          </div>
        </div>

        <div className="pt-2 flex justify-end">

          <button
            type="submit"
            disabled={saving}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>

        </div>
      </form>

    </div>
  );
}