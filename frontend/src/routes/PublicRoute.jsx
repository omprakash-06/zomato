import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function PublicRoute({ redirectTo = "/" }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // already logged in -> don't show login/register again
  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}