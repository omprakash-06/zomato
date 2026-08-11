import { useEffect, useState } from "react";
import {
  Package,
  Loader2,
  CheckCircle2,
  Truck,
  Box,
  XCircle,
  User,
  Calendar,
  CreditCard,
} from "lucide-react";
import api from "../../services/axios";

const STATUS_STYLE = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await api.get("/seller/orders");

      setOrders(res.data.orders || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const getNextStatus = (status) => {
    switch (status) {
      case "pending":
        return "confirmed";

      case "confirmed":
        return "shipped";

      case "shipped":
        return "delivered";

      default:
        return null;
    }
  };

  const getButtonText = (status) => {
    switch (status) {
      case "pending":
        return "Confirm Order";

      case "confirmed":
        return "Mark as Shipped";

      case "shipped":
        return "Mark as Delivered";

      case "delivered":
        return "Delivered";

      case "cancelled":
        return "Cancelled";

      default:
        return "";
    }
  };

  const updateStatus = async (orderId, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);

    if (!nextStatus) return;

    try {
      setUpdatingId(orderId);

      await api.patch(`/seller/${orderId}/status`, {
        status: nextStatus,
      });

      fetchOrders();
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Failed");
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-24 text-center">
        <Package className="mx-auto text-gray-300 mb-3" size={50} />
        <p className="text-gray-500">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      <h1 className="text-3xl font-bold mb-8">
        Seller Orders
      </h1>

      <div className="space-y-6">

        {orders.map((order) => (

          <div
            key={order._id}
            className="bg-white border rounded-2xl shadow-sm overflow-hidden"
          >

            <div className="border-b px-6 py-4 flex flex-wrap justify-between gap-4">

              <div>

                <p className="font-semibold">
                  Order #{order._id.slice(-6)}
                </p>

                <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">

                  <Calendar size={15} />

                  {new Date(order.createdAt).toLocaleDateString("en-IN")}

                </div>

              </div>

              <div className="flex items-center gap-3">

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[order.orderStatus]}`}
                >
                  {order.orderStatus}
                </span>

                <span
                  className={`text-sm font-semibold ${
                    order.paymentStatus === "paid"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {order.paymentStatus}
                </span>

              </div>

            </div>

            <div className="px-6 py-5">

              <div className="flex items-center gap-2 mb-5">

                <User size={18} />

                <div>

                  <p className="font-medium">
                    {order.buyerId?.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {order.buyerId?.email}
                  </p>

                </div>

              </div>

              <div className="space-y-4">

                {order.items.map((item, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between border rounded-xl p-3"
                  >                    <div className="flex items-center gap-4">

                      <img
                        src={
                          item.productId?.thumbnailImage ||
                          item.productId?.images?.[0]
                        }
                        alt={item.productId?.name}
                        className="w-16 h-16 rounded-lg object-cover border"
                      />

                      <div>

                        <h3 className="font-semibold text-gray-900">
                          {item.productId?.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          Quantity : {item.quantity}
                        </p>

                        <p className="text-sm text-gray-500">
                          Price : ₹{item.price}
                        </p>

                      </div>

                    </div>

                    <div className="font-semibold text-lg">
                      ₹{item.price * item.quantity}
                    </div>

                  </div>

                ))}

              </div>

              <div className="border-t mt-6 pt-6 flex flex-wrap justify-between items-center gap-4">

                <div>

                  <div className="flex items-center gap-2 text-gray-600">

                    <CreditCard size={18} />

                    <span>
                      Payment :
                      <span className="font-semibold ml-1 capitalize">
                        {order.paymentMethod}
                      </span>
                    </span>

                  </div>

                  <h2 className="text-2xl font-bold mt-3">
                    Total : ₹{order.totalAmount}
                  </h2>

                </div>

                <div>

                  {order.orderStatus === "pending" && (

                    <button
                      disabled={updatingId === order._id}
                      onClick={() =>
                        updateStatus(order._id, order.orderStatus)
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                    >
                      {updatingId === order._id ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}

                      Confirm Order

                    </button>

                  )}

                  {order.orderStatus === "confirmed" && (

                    <button
                      disabled={updatingId === order._id}
                      onClick={() =>
                        updateStatus(order._id, order.orderStatus)
                      }
                      className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                    >
                      {updatingId === order._id ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Truck size={18} />
                      )}

                      Mark as Shipped

                    </button>

                  )}

                  {order.orderStatus === "shipped" && (

                    <button
                      disabled={updatingId === order._id}
                      onClick={() =>
                        updateStatus(order._id, order.orderStatus)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
                    >
                      {updatingId === order._id ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Box size={18} />
                      )}

                      Mark as Delivered

                    </button>

                  )}

                  {order.orderStatus === "delivered" && (

                    <button
                      disabled
                      className="bg-green-100 text-green-700 px-5 py-2 rounded-lg flex items-center gap-2 cursor-not-allowed"
                    >
                      <CheckCircle2 size={18} />

                      Delivered

                    </button>

                  )}

                  {order.orderStatus === "cancelled" && (

                    <button
                      disabled
                      className="bg-red-100 text-red-700 px-5 py-2 rounded-lg flex items-center gap-2 cursor-not-allowed"
                    >
                      <XCircle size={18} />

                      Cancelled

                    </button>

                  )}

                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}