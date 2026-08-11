import { BrowserRouter, useRoutes } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import {CartProvider} from "./context/cartContext"
import { AdminProvider } from "./context/adminContext";

import AppRoutes from "./routes/AppRoutes";
import BuyerRoutes from "./routes/BuyerRoutes";
import SellerRoutes from "./routes/SellerRoutes"; 
import AdminRoutes from "./routes/AdminRoutes";

function AllRoutes() {
  return useRoutes([
    ...AppRoutes,
    ...BuyerRoutes,
    ...SellerRoutes,
    ...AdminRoutes,
  ]);
}

export default function App() {
  return (
    <BrowserRouter>
    < AdminProvider>
      <AuthProvider>
        <CartProvider>
        <AllRoutes />       
        </CartProvider>
      </AuthProvider>
    </ AdminProvider>
    </BrowserRouter>
  );
}
