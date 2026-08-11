import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { MapPin, ShieldCheck, Loader2, ChevronLeft } from "lucide-react";
import api from "../../services/axios";
import { useAuth } from "../../context/authContext";
import { useCart } from "../../context/cartContext";
import { openRazorpayCheckout } from "../../utils/razorpayCheckout";

const emptyAddress = { house: "", street: "", state: "", pincode: "", country: "india" };

/**
 * Checkout flow entry points:
 *   /checkout?type=buyNow&productId=X&size=M&quantity=1
 *   /checkout?type=cart
 *
 * Backend:
 *   POST /order/create/:type/:productId  { quantity, size, addressType, address }
 *   POST /order/verify-payment           { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
export default function CheckoutPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items: cartItems } = useCart();

  const type = params.get("type") === "cart" ? "cart" : "buyNow";
  const productIdParam = params.get("productId");
  const size = params.get("size") || undefined;
  const quantity = Number(params.get("quantity")) || 1;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [permanentAddress, setPermanentAddress] = useState(null);
  const [addressMode, setAddressMode] = useState("permanent"); // "permanent" | "new"
  const [newAddress, setNewAddress] = useState(emptyAddress);

  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    loadCheckoutData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCheckoutData() {
    setLoading(true);
    setError("");
    try {
      // fetch buyer's saved address
      const buyerRes = await api.get("/buyer/me");
      const addr = buyerRes.data?.address;
      const hasSavedAddress = !!(addr && (addr.house || addr.street || addr.state || addr.pincode));
      setPermanentAddress(hasSavedAddress ? addr : null);
      setAddressMode(hasSavedAddress ? "permanent" : "new");

      // fetch product only for buyNow flow (cart flow uses CartContext items)
      if (type === "buyNow") {
        if (!productIdParam) {
          setError("No product selected for checkout.");
          return;
        }
        const res = await api.get(`/product/${productIdParam}`);
        const data = res.data?.data?.product || res.data?.data || null;
        setProduct(data);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while loading checkout details.");
    } finally {
      setLoading(false);
    }
  }

  function updateNewAddress(field, value) {
    setNewAddress((a) => ({ ...a, [field]: value }));
  }

  // ----- order summary -----
  const summaryItems =
    type === "buyNow"
      ? product
        ? [{ name: product.name, image: product.thumbnailImage, price: product.actualPrice, quantity, size }]
        : []
      : cartItems.map((item) => ({
          name: item.productId?.name,
          image: item.productId?.thumbnailImage,
          price: item.productId?.actualPrice ?? item.productId?.price,
          quantity: item.quantity,
          size: item.size,
        }));

  const totalAmount = summaryItems.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0);

  async function handlePlaceOrder() {
    setError("");

    if (addressMode === "new") {
      const { house, street, state, pincode, country } = newAddress;
      if (!house.trim() || !street.trim() || !state.trim() || !pincode.trim() || !country.trim()) {
        setError("Please fill in all address fields.");
        return;
      }
    }

    setPlacing(true);
    try {
      const body = {
        quantity: type === "buyNow" ? quantity : undefined,
        size: type === "buyNow" ? size : undefined,
        addressType: addressMode,
        address: addressMode === "new" ? newAddress : undefined,
      };

      // cart flow doesn't need a productId in the URL, only buyNow does
      const createUrl =
        type === "buyNow" ? `/order/create/buyNow/${productIdParam}` : `/order/create/cart`;

      const createRes = await api.post(createUrl, body);
      const orderData = createRes.data?.data;

      const paymentResponse = await openRazorpayCheckout(orderData, {
        name: user?.name,
        email: user?.email,
      });

      const verifyRes = await api.post("/order/verify-payment", {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      const orders = verifyRes.data?.data || [];
      navigate("/order-success", { state: { orders } });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "Payment could not be completed.");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (error && summaryItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">{error}</p>
        <Link to="/" className="text-brand-600 font-medium hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 mb-4">
        <ChevronLeft size={15} />
        Back
      </Link>
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Address */}
          <div className="border rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-brand-600" />
              Shipping Address
            </h2>

            {permanentAddress && (
              <label
                className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer mb-3 ${
                  addressMode === "permanent" ? "border-brand-600 bg-brand-50/40" : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="addressMode"
                  checked={addressMode === "permanent"}
                  onChange={() => setAddressMode("permanent")}
                  className="mt-1"
                />
                <div className="text-sm text-gray-700 leading-relaxed">
                  <p className="font-medium text-gray-900 mb-1">Saved Address</p>
                  <p>{permanentAddress.house}</p>
                  <p>{permanentAddress.street}</p>
                  <p>
                    {permanentAddress.state} - {permanentAddress.pincode}
                  </p>
                  <p className="capitalize">{permanentAddress.country}</p>
                </div>
              </label>
            )}

            <label
              className={`flex items-start gap-3 border rounded-xl p-4 cursor-pointer ${
                addressMode === "new" ? "border-brand-600 bg-brand-50/40" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="addressMode"
                checked={addressMode === "new"}
                onChange={() => setAddressMode("new")}
                className="mt-1"
              />
              <span className="text-sm font-medium text-gray-900">Use a different address</span>
            </label>

            {addressMode === "new" && (
              <div className="mt-4 space-y-3">
                <Field label="House / Flat No." value={newAddress.house} onChange={(v) => updateNewAddress("house", v)} />
                <Field label="Street" value={newAddress.street} onChange={(v) => updateNewAddress("street", v)} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="State" value={newAddress.state} onChange={(v) => updateNewAddress("state", v)} />
                  <Field
                    label="Pincode"
                    value={newAddress.pincode}
                    onChange={(v) => updateNewAddress("pincode", v.replace(/\D/g, ""))}
                  />
                </div>
                <Field label="Country" value={newAddress.country} onChange={(v) => updateNewAddress("country", v)} />
              </div>
            )}
          </div>

          {/* Order items */}
          <div className="border rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Order Items ({summaryItems.length})</h2>
            <div className="divide-y">
              {summaryItems.map((it, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <div className="w-14 h-14 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                    {it.image && <img src={it.image} alt={it.name} className="w-full h-full object-contain" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{it.name}</p>
                    <p className="text-xs text-gray-500">
                      {it.size && `Size: ${it.size} · `}Qty: {it.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">₹{(it.price || 0) * (it.quantity || 0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="border rounded-2xl p-5 lg:sticky lg:top-20">
          <h2 className="font-semibold text-gray-900 mb-4">Price Details</h2>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Total ({summaryItems.length} items)</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-4">
            <span>Delivery Charges</span>
            <span className="text-green-600">Free</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 border-t pt-4 mb-1">
            <span>Total Amount</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={placing || summaryItems.length === 0}
            className="w-full mt-5 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl"
          >
            {placing && <Loader2 size={16} className="animate-spin" />}
            {placing ? "Processing..." : `Proceed to Pay ₹${totalAmount.toLocaleString()}`}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-4">
            <ShieldCheck size={13} />
            Secured by Razorpay
          </p>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"
      />
    </div>
  );
}