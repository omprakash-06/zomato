import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, UtensilsCrossed, ClipboardList, Store } from "lucide-react";

const sellerLinks = [
  { to: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/seller/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/seller/orders", label: "Orders", icon: ClipboardList },
  { to: "/seller/shop-settings", label: "Restaurant Profile", icon: Store },
];

export default function SellerLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col">
        <div className="p-4 text-lg font-semibold border-b flex items-center gap-2">
          <UtensilsCrossed className="text-brand-500" size={20} />
          Restaurant Panel
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {sellerLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? "bg-brand-50 text-brand-600 font-medium" : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b bg-white flex items-center justify-between px-6">
          <h1 className="font-medium">Restaurant Dashboard</h1>
        </header>
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
