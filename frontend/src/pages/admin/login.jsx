import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { useAdmin } from "../../context/adminContext";

export default function AdminLogin() {
  const { login } = useAdmin();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="text-brand-600" size={26} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage coder.op</p>
        </div>

        <form onSubmit={handleSubmit} className="border rounded-2xl p-6 space-y-4 bg-white">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-500"
              placeholder="admin@coder.op"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full border rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}