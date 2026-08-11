import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function ProtectedRoute({ roles = [], redirectTo = "/login" }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // not logged in -> login page
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  const userRoles = user?.roles || []; // array: ["buyer"], ["buyer","seller"] etc.

  // role required but user doesn't have it -> block
  if (roles.length && !roles.some((r) => userRoles.includes(r))) {
    return <Navigate to="/" replace />;
  }

  // authorized
  return <Outlet />;
}