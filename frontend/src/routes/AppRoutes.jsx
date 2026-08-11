import RootLayout from "../layouts/AppLayout";
import PublicRoute from "./PublicRoute";
import Home from "../pages/auth/home";
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";
import RestaurantDetail from "../pages/auth/RestaurantDetail";
import ProductDetail from "../pages/auth/ProductDetail";

const AppRoutes = [
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/restaurant/:id",
        element: <RestaurantDetail />,
      },
      {
        path: "/product/:id",
        element: <ProductDetail />,
      },
    ],
  },

  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
];

export default AppRoutes;