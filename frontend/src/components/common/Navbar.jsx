import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Heart,
  User,
  Home,
  Truck,
  Package,
  LogOut,
  UtensilsCrossed,
  Store,
} from "lucide-react";
import { useAuth } from "../../context/authContext";
import { useCart } from "../../context/cartContext";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/?search=${encodeURIComponent(q)}` : "/");
  }

  const userRoles = user?.roles || [];
  const isSeller = userRoles.includes("seller");
  const { cartCount } = useCart();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <UtensilsCrossed className="text-brand-500" size={26} strokeWidth={2.3} />
          <span className="text-2xl font-extrabold text-gray-900">
            Food<span className="text-brand-500">ly</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-xl items-center border rounded-lg overflow-hidden"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants or cuisines..."
            className="flex-1 px-3 py-2.5 text-sm outline-none"
          />
          <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5">
            <Search size={18} />
          </button>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-5 shrink-0">
          {isLoggedIn && (
            <Link to="/liked" className="hidden md:flex flex-col items-center text-gray-700 hover:text-brand-500">
              <Heart size={20} />
              <span className="text-xs mt-0.5">Liked</span>
            </Link>
          )}

          <div className="relative hidden md:block" ref={dropdownRef}>
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex flex-col items-center text-gray-700 hover:text-brand-500"
                >
                  <User size={20} />
                  <span className="text-xs mt-0.5">Profile</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border rounded-xl shadow-lg overflow-hidden">
                    <div className="flex items-center gap-3 p-4 border-b">
                      <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-semibold flex items-center justify-center">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 border-t"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="flex flex-col items-center text-gray-700 hover:text-brand-500">
                <User size={20} />
                <span className="text-xs mt-0.5">Login</span>
              </Link>
            )}
          </div>

          <Link to="/cart" className="flex flex-col items-center relative text-gray-700 hover:text-brand-500">
            <ShoppingCart size={20} />
            <span className="hidden md:block text-xs mt-0.5">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-500 text-white text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {isSeller ? (
            <Link
              to="/seller/dashboard"
              className="hidden md:flex flex-col items-center bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg"
            >
              <span className="font-semibold text-sm">Dashboard</span>
              <span className="text-[10px] opacity-90">Restaurant Panel</span>
            </Link>
          ) : (
            <Link
              to={isLoggedIn ? "/seller/registration" : "/register"}
              className="hidden md:flex flex-col items-center bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg"
            >
              <span className="font-semibold text-sm">Partner</span>
              <span className="text-[10px] opacity-90">List your restaurant</span>
            </Link>
          )}

          <button className="md:hidden text-gray-700" onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div className="hidden md:block border-t">
        <div className="max-w-7xl mx-auto flex items-center gap-8 px-4">
          <SecondaryLink to="/" icon={<Home size={16} />} label="Home" />
          <SecondaryLink to="/orders" icon={<Truck size={16} />} label="Track Order" />
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-1">
          <form
            onSubmit={(e) => {
              handleSearchSubmit(e);
              setMobileOpen(false);
            }}
            className="flex items-center border rounded-lg overflow-hidden mb-3"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants..."
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="bg-brand-500 text-white px-3 py-2">
              <Search size={16} />
            </button>
          </form>

          <MobileLink to="/" icon={<Home size={18} />} label="Home" onClick={() => setMobileOpen(false)} />
          <MobileLink to="/orders" icon={<Truck size={18} />} label="Track Order" onClick={() => setMobileOpen(false)} />
          <MobileLink to="/cart" icon={<ShoppingCart size={18} />} label="Cart" onClick={() => setMobileOpen(false)} />

          {isLoggedIn ? (
            <>
              <MobileLink to="/liked" icon={<Heart size={18} />} label="Liked" onClick={() => setMobileOpen(false)} />
              <MobileLink to="/profile" icon={<User size={18} />} label="Profile" onClick={() => setMobileOpen(false)} />
              <MobileLink to="/orders" icon={<Package size={18} />} label="My Orders" onClick={() => setMobileOpen(false)} />
              {isSeller ? (
                <MobileLink to="/seller/dashboard" icon={<Store size={18} />} label="Restaurant Dashboard" onClick={() => setMobileOpen(false)} />
              ) : (
                <MobileLink to="/seller/registration" icon={<Store size={18} />} label="List Your Restaurant" onClick={() => setMobileOpen(false)} />
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 w-full px-2 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <MobileLink to="/login" icon={<User size={18} />} label="Login" onClick={() => setMobileOpen(false)} />
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-2 py-2.5 rounded-lg text-sm font-medium bg-brand-500 text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function SecondaryLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-colors ${
          isActive ? "border-brand-500 text-brand-600" : "border-transparent text-gray-600 hover:text-brand-500"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

function MobileLink({ to, icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 px-2 py-2.5 rounded-lg text-sm font-medium ${
          isActive ? "bg-brand-50 text-brand-600" : "text-gray-700 hover:bg-gray-50"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
