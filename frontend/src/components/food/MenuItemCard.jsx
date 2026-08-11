import { Plus, Loader2 } from "lucide-react";
import { useCart } from "../../context/cartContext";
import { useState } from "react";

export default function MenuItemCard({ item }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const finalPrice = item.actualPrice ?? item.price;
  const hasDiscount = item.discount > 0;

  async function handleAdd() {
    setAdding(true);
    try {
      await addToCart(item._id, { quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <span className={item.isVeg ? "veg-dot" : "nonveg-dot"} />
        <h4 className="font-medium text-gray-900 mt-1.5 line-clamp-1">{item.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold text-gray-900">₹{finalPrice}</span>
          {hasDiscount && <span className="text-xs text-gray-400 line-through">₹{item.price}</span>}
        </div>
        {item.description && (
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{item.description}</p>
        )}
      </div>

      <div className="w-28 shrink-0 flex flex-col items-center">
        <div className="w-28 h-24 rounded-xl bg-gray-100 overflow-hidden">
          {item.thumbnailImage && (
            <img src={item.thumbnailImage} alt={item.name} className="w-full h-full object-cover" />
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={adding}
          className="-mt-3 bg-white border border-brand-500 text-brand-600 font-semibold text-xs px-4 py-1.5 rounded-lg shadow-sm hover:bg-brand-50 disabled:opacity-60 flex items-center gap-1"
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
      </div>
    </div>
  );
}
