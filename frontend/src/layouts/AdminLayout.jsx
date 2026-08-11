import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Store, ShieldCheck, Settings } from "lucide-react";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/approved/sellers", label: "Restaurants", icon: Store },
  { to: "/admin/category", label: "Category", icon: ShieldCheck },
  { to: "/admin/orders", label: "Oders", icon: Settings },
];

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-gray-200 flex flex-col">
        <div className="p-4 text-lg font-semibold border-b border-gray-700">Admin Panel</div>
        <nav className="flex-1 p-2 space-y-1">
          {adminLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? "bg-gray-800 text-white font-medium" : "text-gray-400 hover:bg-gray-800"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b flex items-center justify-between px-6">
          <h1 className="font-medium">Admin Dashboard</h1>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
