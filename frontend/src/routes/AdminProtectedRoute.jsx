import { Navigate, Outlet } from "react-router-dom";
import { useAdmin } from "../context/adminContext";

// Separate from ProtectedRoute (buyer/seller) because admin auth runs on
// its own context/token — useAuth().user is always null for an admin
// session, so the regular ProtectedRoute can never let an admin through.
export default function AdminProtectedRoute({ redirectTo = "/admin/login" }) {
  const { isLoggedIn, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}