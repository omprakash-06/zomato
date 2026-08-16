import { Link, useNavigate } from "react-router-dom";
import { Plus, Loader2, Star, Store } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../context/cartContext";
import { useAuth } from "../../context/authContext";

export default function DishCard({ item }) {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const finalPrice = item.actualPrice ?? item.price;
  const hasDiscount = item.discount > 0;

  async function handleAdd() {
    if (!isLoggedIn) {
      const goLogin = window.confirm("Please login to add items to your cart. Go to login page now?");
      if (goLogin) navigate("/login");
      return;
    }
    setAdding(true);
    try {
      await addToCart(item._id, { quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } catch (err) {
      console.error(err);
      window.alert("Couldn't add this to your cart. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/product/${item._id}`} className="relative h-36 bg-gray-100 block">
        {item.thumbnailImage ? (
          <img
            src={item.thumbnailImage}
            alt={item.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/placeholder-product.png";
            }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Store size={28} />
          </div>
        )}
        <span className={`absolute top-2 left-2 ${item.isVeg ? "veg-dot" : "nonveg-dot"}`} />
      </Link>

      <button
        onClick={handleAdd}
        disabled={adding}
        className="mt-2 ml-auto mr-3 flex items-center gap-1 bg-white border border-brand-500 text-brand-600 font-semibold text-xs px-4 py-1.5 rounded-lg shadow-sm hover:bg-brand-50 disabled:opacity-60"
      >
        {adding ? (
          <Loader2 size={12} className="animate-spin" />
        ) : added ? (
          "Added ✓"
        ) : (
          <>
            <Plus size={12} /> ADD
          </>
        )}
      </button>

      <div className="p-3 pt-2">
        <Link to={`/product/${item._id}`} className="font-medium text-gray-900 line-clamp-1 text-sm hover:text-brand-600">
          {item.name}
        </Link>

        {item.restaurant?._id && (
          <Link
            to={`/restaurant/${item.restaurant._id}`}
            className="text-xs text-gray-500 hover:text-brand-600 line-clamp-1 mt-0.5 block"
          >
            {item.restaurant.shopname}
          </Link>
        )}

        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-semibold text-gray-900 text-sm">₹{finalPrice}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">₹{item.price}</span>
          )}
        </div>

        {item.averageRating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-gray-700">
              {Number(item.averageRating).toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}