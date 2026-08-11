import SellerLayout from "../layouts/SellerLayout";
import ProtectedRoute from "./ProtectedRoute";

import SellerOrders from "../pages/seller/sellerOders";
import SellerDashboard from "../pages/seller/dashboard";
import SellerMenu from "../pages/seller/menu";
import SellerShopSettings from "../pages/seller/profile";

const SellerRoutes = [
  {
    element: <ProtectedRoute roles={["seller"]} />,
    children: [
      {
        element: <SellerLayout />,
        children: [
          {
            path: "/seller/orders",
            element: <SellerOrders />,
          },
          {
            path: "/seller/dashboard",
            element: <SellerDashboard />,
          },
          {
            path: "/seller/menu",
            element: <SellerMenu />,
          },
          {
            path: "/seller/shop-settings",
            element: <SellerShopSettings />,
          },
        ],
      },
    ],
  },
];

export default SellerRoutes;
