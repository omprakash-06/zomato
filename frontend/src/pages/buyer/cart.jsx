import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "../../context/cartContext";

const FREE_DELIVERY_THRESHOLD = 499;

/**
 * Assumes each cart item's productId is populated with product details:
 *   { _id, name, thumbnailImage, price, actualPrice, discount, brand, stock }
 * If your GET /cart/items controller doesn't populate("items.productId"),
 * add that populate call so this page has data to render.
 */
export default function CartPage() {
  const navigate = useNavigate();
  const { items, loading, cartCount, updateQuantity, removeItem, clearCart } = useCart();
  const [pendingKey, setPendingKey] = useState(null); // `${productId}-${size}` currently updating

  const subtotal = items.reduce((sum, item) => {
  const product = item.productId;
  const price = product?.price ?? 0;
  return sum + price * (item.quantity || 0);
  }, 0);

const originalTotal = items.reduce((sum, item) => {
  const product = item.productId;
  const price = product.actualPrice ?? 0;
  return sum + price * (item.quantity || 0);
}, 0);

const savings = Math.max( subtotal - originalTotal, 0);

const shipping =
  subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : 49;

const total = subtotal - savings + shipping;
  function keyFor(item) {
    return `${item.productId?._id || item.productId}-${item.size || ""}`;
  }

  async function handleQuantityChange(item, nextQty) {
    if (nextQty < 1) return;
    const key = keyFor(item);
    setPendingKey(key);
    try {
      await updateQuantity(item.productId?._id || item.productId, {
        size: item.size,
        quantity: nextQty,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setPendingKey(null);
    }
  }

  async function handleRemove(item) {
    const key = keyFor(item);
    setPendingKey(key);
    try {
      await removeItem(item.productId?._id || item.productId, { size: item.size });
    } catch (err) {
      console.error(err);
    } finally {
      setPendingKey(null);
    }
  }

  async function handleClearCart() {
    if (!window.confirm("Remove all items from your cart?")) return;
    try {
      await clearCart();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Shopping Cart{" "}
          <span className="text-gray-400 font-medium text-base md:text-lg">
            ({cartCount} {cartCount === 1 ? "item" : "items"})
          </span>
        </h1>
        <button
          onClick={handleClearCart}
          className="text-sm font-medium text-red-500 hover:text-red-600"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start">
        {/* ----- Items list ----- */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.productId || {};
            const key = keyFor(item);
            const isPending = pendingKey === key;
            const price = product.actualPrice ?? product.price ?? 0;
            const hasDiscount = product.price > price;

            return (
              <div
                key={key}
                className="flex gap-4 border rounded-2xl p-4"
              >
                <Link
                  to={`/`}
                  className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center"
                >
                  {product.thumbnailImage ? (
                    <img
                      src={product.thumbnailImage}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ShoppingCart className="text-gray-300" size={28} />
                  )}
                </Link>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {product.brand && (
                        <p className="text-xs font-medium text-brand-600">{product.brand}</p>
                      )}
                      <Link
                        to={`/`}
                        className="font-medium text-gray-900 hover:text-brand-600 line-clamp-2"
                      >
                        {product.name || "Product"}
                      </Link>
                      {item.size && (
                        <p className="text-xs text-gray-500 mt-1">Size: {item.size}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item)}
                      disabled={isPending}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-50 shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-auto pt-3 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">₹{price}</span>
                      {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                      )}
                    </div>

                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item, (item.quantity || 1) - 1)}
                        disabled={isPending || item.quantity <= 1}
                        className="p-2 text-gray-500 hover:text-brand-600 disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, (item.quantity || 1) + 1)}
                        disabled={isPending || (product.stock != null && item.quantity >= product.stock)}
                        className="p-2 text-gray-500 hover:text-brand-600 disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 mt-2"
          >
            <ArrowLeft size={15} />
            Continue Ordering
          </Link>
        </div>

        {/* ----- Summary ----- */}
        <div className="border rounded-2xl p-5 lg:sticky lg:top-20">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-green-600">
                <span>You save</span>
                <span>-₹{savings.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>
          </div>

          {shipping > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Add items worth ₹{(FREE_DELIVERY_THRESHOLD - subtotal).toLocaleString()} more for free delivery
            </p>
          )}

          <div className="flex justify-between font-semibold text-gray-900 border-t mt-4 pt-4">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>

          <button
            onClick={() => navigate("/checkout?type=cart")}
            className="w-full mt-5 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl"
          >
            Proceed to Checkout
          </button>

          <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t text-center">
            <TrustBadge icon={<Truck size={16} />} label="Free Delivery" />
            <TrustBadge icon={<RotateCcw size={16} />} label="Easy Returns" />
            <TrustBadge icon={<ShieldCheck size={16} />} label="Secure" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBadge({ icon, label }) {
  return (
    <div className="flex flex-col items-center gap-1 text-gray-500">
      {icon}
      <span className="text-[10px]">{label}</span>
    </div>
  );
}

function EmptyCart() {
  return (
    <section className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-5">
        <ShoppingCart className="text-brand-600" size={28} />
      </div>
      <h1 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h1>
      <p className="text-sm text-gray-500 mb-6">
        Looks like you haven't added anything yet. Explore restaurants and add some food.
      </p>
      <Link
        to="/"
        className="inline-block bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-6 py-2.5 rounded-lg"
      >
        Browse Restaurants
      </Link>
    </section>
  );
}

function CartSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6 md:py-8 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-gray-100" />
      </div>
    </section>
  );
}