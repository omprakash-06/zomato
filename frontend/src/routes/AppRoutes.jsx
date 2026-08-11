import RootLayout from "../layouts/AppLayout";
import PublicRoute from "./PublicRoute";
import Home from "../pages/auth/home";
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";
import RestaurantDetail from "../pages/auth/RestaurantDetail";

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
