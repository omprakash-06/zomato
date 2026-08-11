import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  MapPin,
  ShieldAlert,
  LogOut,
  Monitor,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../services/axios";
import { useAuth } from "../../context/authContext";
import { clearAccessToken } from "../../services/tokenStore";

export default function ProfilePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("password"); // "password" | "address" | "account"

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Account</h1>

      {/* Profile header — read only, name/email come from the logged-in session */}
      <div className="flex items-center gap-4 border rounded-xl p-5 mb-8 bg-gray-50">
        <div className="w-14 h-14 rounded-full bg-brand-600 text-white text-xl font-semibold flex items-center justify-center shrink-0">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{user?.name || "—"}</p>
          <p className="text-sm text-gray-500 truncate">{user?.email || "—"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-8">
        <TabButton active={tab === "password"} onClick={() => setTab("password")} icon={<Lock size={16} />}>
          Change Password
        </TabButton>
        <TabButton active={tab === "address"} onClick={() => setTab("address")} icon={<MapPin size={16} />}>
          Address
        </TabButton>
        <TabButton active={tab === "account"} onClick={() => setTab("account")} icon={<ShieldAlert size={16} />}>
          Account
        </TabButton>
      </div>

      {tab === "password" && <ChangePasswordSection />}
      {tab === "address" && <AddressSection />}
      {tab === "account" && <AccountSection />}
    </div>
  );
}

function TabButton({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active
          ? "border-brand-600 text-brand-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

/* ============================== PASSWORD ============================== */

function ChangePasswordSection() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    try {
      await api.put("/auth/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess("Password updated successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update password. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Change Password</h2>
      <p className="text-sm text-gray-500 mb-6">
        Choose a strong password you haven't used before.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField
          label="Current Password"
          value={form.currentPassword}
          onChange={(v) => update("currentPassword", v)}
          show={showCurrent}
          toggleShow={() => setShowCurrent((s) => !s)}
          required
        />
        <PasswordField
          label="New Password"
          value={form.newPassword}
          onChange={(v) => update("newPassword", v)}
          show={showNew}
          toggleShow={() => setShowNew((s) => !s)}
          required
        />
        <PasswordField
          label="Confirm New Password"
          value={form.confirmPassword}
          onChange={(v) => update("confirmPassword", v)}
          show={showNew}
          toggleShow={() => setShowNew((s) => !s)}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, toggleShow, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:border-brand-500"
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

/* ========================= PERMANENT ADDRESS ========================= */

const emptyAddress = {
  house: "",
  street: "",
  state: "",
  pincode: "",
  country: "india",
};


function AddressSection() {
  const [form, setForm] = useState(emptyAddress);
  const [hasAddress, setHasAddress] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAddress();
  }, []);

  async function fetchAddress() {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await api.get("/buyer/me");
      const addr = res.data?.address;
      const filled = !!(addr && (addr.house || addr.street || addr.state || addr.pincode));
      setForm({ ...emptyAddress, ...(addr || {}) });
      setHasAddress(filled);
      setEditing(!filled); // no address saved yet -> go straight to the form
    } catch (err) {
      console.error(err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await api.put("/buyer/address", {
        ...form,
        pincode: Number(form.pincode),
      });
      const updated = res.data?.data;
      if (updated) setForm({ ...emptyAddress, ...updated });
      setHasAddress(true);
      setEditing(false);
      setSuccess("Address updated successfully.");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update address. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-md space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (fetchError) {
    return (
      <p className="text-sm text-gray-500 py-6 text-center">
        Something went wrong while loading your address.
      </p>
    );
  }

  // ----- VIEW MODE: show the currently saved address -----
  if (hasAddress && !editing) {
    return (
      <div className="max-w-md">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-900">Permanent Address</h2>
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Edit
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          This address is used for delivery and order-related communication.
        </p>

        {success && <p className="text-sm text-green-600 mb-3">{success}</p>}

        <div className="border rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
          <p>{form.house}</p>
          <p>{form.street}</p>
          <p>
            {form.state} - {form.pincode}
          </p>
          <p className="capitalize">{form.country}</p>
        </div>
      </div>
    );
  }

  // ----- EDIT MODE: form (also used the first time, when no address exists yet) -----
  return (
    <div className="max-w-md">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-900">
          {hasAddress ? "Edit Address" : "Add Permanent Address"}
        </h2>
        {hasAddress && (
          <button
            onClick={() => setEditing(false)}
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-6">
        This address is used for delivery and order-related communication.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="House / Flat No." value={form.house} onChange={(v) => update("house", v)} required />
        <Field label="Street" value={form.street} onChange={(v) => update("street", v)} required />
        <Field label="State" value={form.state} onChange={(v) => update("state", v)} required />
        <Field
          label="Pincode"
          value={form.pincode}
          onChange={(v) => update("pincode", v.replace(/\D/g, ""))}
          required
          inputMode="numeric"
        />
        <Field label="Country" value={form.country} onChange={(v) => update("country", v)} required />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? "Saving..." : "Save Address"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required, inputMode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500"
      />
    </div>
  );
}

/* ============================== ACCOUNT ============================== */

function AccountSection() {
  const { logout, logoutAll } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleLogoutAll() {
    setLoggingOutAll(true);
    try {
      await logoutAll();
      navigate("/login");
    } finally {
      setLoggingOutAll(false);
    }
  }

  async function handleDeleteAccount() {
    setError("");
    if (confirmText.trim().toUpperCase() !== "DELETE") {
      setError('Please type "DELETE" to confirm.');
      return;
    }
    setDeleting(true);
    try {
      await api.delete("/auth/delete/account");
      clearAccessToken();
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to delete account. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-md space-y-10">
      {/* Session management */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Sessions</h2>
        <p className="text-sm text-gray-500 mb-4">
          Sign out of this device, or sign out everywhere you're currently logged in.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-sm font-medium text-gray-700 px-4 py-2.5 rounded-lg"
          >
            {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            Logout
          </button>
          <button
            onClick={handleLogoutAll}
            disabled={loggingOutAll}
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-sm font-medium text-gray-700 px-4 py-2.5 rounded-lg"
          >
            {loggingOutAll ? <Loader2 size={16} className="animate-spin" /> : <Monitor size={16} />}
            Logout from all devices
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-red-200 rounded-xl p-5 bg-red-50/40">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-red-600 mb-1">
          <ShieldAlert size={18} />
          Danger Zone
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Deleting your account is permanent and cannot be undone. All your data will be lost.
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type <span className="font-semibold">DELETE</span> to confirm
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-red-500 mb-3"
          placeholder="DELETE"
        />

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg"
        >
          {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          {deleting ? "Deleting..." : "Delete My Account"}
        </button>
      </div>
    </div>
  );
}