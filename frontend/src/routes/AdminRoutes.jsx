import AdminLayout from "../layouts/AdminLayout";
import AdminProtectedRoute from "./AdminProtectedRoute";
import PublicRoute from "./PublicRoute";

import AdminLogin from "../pages/admin/login";
import AdminDashboard from "../pages/admin/dashboard";
import AdminSellerApplication from "../pages/admin/sellerApplication";
import AdminCategory from "../pages/admin/category";
import AdminOrders from"../pages/admin/AdminOrders";
import ApprovedSellers from "../pages/admin/ApprovedSellers";

const AdminRoutes = [
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/admin/login",
        element: <AdminLogin />,
      },
    ],
  },

  {
    // FIX: redirectTo="/admin/login" added, otherwise unauthenticated
    // admin users were bounced to the generic "/login" page
    element: <AdminProtectedRoute roles={["admin"]} redirectTo="/admin/login" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "/admin/dashboard",
            element: <AdminDashboard />,
          },
          {
            path: "/admin/category",
            element: <AdminCategory />,
          },
          {
            path: "/admin/seller/application",
            element: <AdminSellerApplication />,
          },
          {
            path:"/admin/orders",
            element:<AdminOrders/>
          },
          {
            path:"/admin/approved/sellers",
            element:<ApprovedSellers/>
          }
        ],
      },
    ],
  },
];

export default AdminRoutes;
