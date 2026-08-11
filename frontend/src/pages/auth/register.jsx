import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2 } from "lucide-react";
import api from "../../services/axios";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "",  password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-1 text-3xl font-bold mb-8">
          <span className="text-gray-900">Food</span>
          <span className="text-brand-600">ly</span>
        </Link>

        <div className="bg-white border rounded-2xl shadow-sm p-7">
          <h1 className="text-xl font-semibold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">Join Foodly and start ordering</p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Full name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Rahul Kumar"
                  className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full border rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 text-white font-medium rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 hover:bg-brand-700 disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-600 font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
