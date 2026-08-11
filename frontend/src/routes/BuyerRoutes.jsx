import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";

import BuyerProfile from "../pages/buyer/profile";
import Cart from "../pages/buyer/cart";
import Orders from "../pages/buyer/MyOrdersPage";
import OrderDetails from "../pages/buyer/OrderDetailsPage";
import Checkout from "../pages/buyer/CheckoutPage";
import PaymentSuccess from "../pages/buyer/OrderSuccessPage";
import SellerRegistration from "../pages/buyer/sellerRegister";
import Liked from "../pages/buyer/Liked";

const BuyerRoutes = [
  {
    element: <ProtectedRoute roles={["buyer"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/profile", element: <BuyerProfile /> },
          { path: "/cart", element: <Cart /> },
          { path: "/orders", element: <Orders /> },
          { path: "/orders/:id", element: <OrderDetails /> },
          { path: "/checkout", element: <Checkout /> },
          { path: "/order-success", element: <PaymentSuccess /> },
          { path: "/liked", element: <Liked /> },

          { path: "/seller/registration", element: <SellerRegistration /> },
        ],
      },
    ],
  },
];

export default BuyerRoutes;