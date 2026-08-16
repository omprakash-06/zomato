import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Star, Store, Plus, Minus, Loader2 } from "lucide-react";
import api from "../../services/axios";
import { useCart } from "../../context/cartContext";
import { useAuth } from "../../context/authContext";
import DishCard from "../../components/food/DishCard";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const [moreFromRestaurant, setMoreFromRestaurant] = useState([]);
  const [similarDishes, setSimilarDishes] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      setMoreFromRestaurant([]);
      setSimilarDishes([]);
      try {
        const res = await api.get(`/product/${id}`);
        const data = res.data?.data || null;
        if (!cancelled) setProduct(data);

        // fire-and-forget: related sections shouldn't block the main page
        if (data?.restaurant?._id) {
          api
            .get(`/product/restaurant/${data.restaurant._id}`)
            .then((r) => {
              if (cancelled) return;
              const list = (r.data?.data || []).filter((p) => p._id !== id).slice(0, 6);
              setMoreFromRestaurant(list);
            })
            .catch(() => {});
        }
        if (data?.category?._id) {
          api
            .get(`/product`, { params: { category: data.category._id, limit: 8 } })
            .then((r) => {
              if (cancelled) return;
              const list = (r.data?.data || []).filter((p) => p._id !== id).slice(0, 6);
              setSimilarDishes(list);
            })
            .catch(() => {});
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Product not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  function requireLogin() {
    const goLogin = window.confirm("Please login to continue. Go to login page now?");
    if (goLogin) navigate("/login");
  }

  async function handleAdd() {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    setAdding(true);
    try {
      await addToCart(product._id, { quantity: qty });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error(err);
      window.alert("Couldn't add this to your cart. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  function handleBuyNow() {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    navigate(`/checkout?type=buyNow&productId=${product._id}&quantity=${qty}`);
  }

  if (loading) return <DetailSkeleton />;

  if (error || !product) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 mb-4">{error || "Something went wrong."}</p>
        <Link to="/" className="text-brand-600 font-medium hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const finalPrice = product.actualPrice ?? product.price;
  const hasDiscount = product.discount > 0;
  const gallery = [product.thumbnailImage, ...(product.images || [])].filter(Boolean);
  const restaurant = product.restaurant;

  return (
    <div className="bg-[#fffaf6] min-h-screen pb-16">
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-4"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image gallery */}
          <div>
            <div className="aspect-square rounded-2xl bg-gray-100 overflow-hidden">
              {gallery.length > 0 ? (
                <img
                  src={gallery[activeImage]}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/placeholder-product.png";
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Store size={48} />
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2 mt-3">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      activeImage === i ? "border-brand-500" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <span className={product.isVeg ? "veg-dot" : "nonveg-dot"} />
            <h1 className="text-2xl font-extrabold text-gray-900 mt-2">{product.name}</h1>

            {product.category?.name && (
              <span className="inline-block text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-full mt-2">
                {product.category.name}
              </span>
            )}

            {restaurant && (
              <Link
                to={`/restaurant/${restaurant._id}`}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-brand-600 mt-3"
              >
                <Store size={15} className="text-brand-500" />
                {restaurant.shopname}
              </Link>
            )}

            {product.averageRating > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-700">
                  {Number(product.averageRating).toFixed(1)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <span className="text-2xl font-bold text-gray-900">₹{finalPrice}</span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                  <span className="text-xs font-semibold text-green-600">{product.discount}% OFF</span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">{product.description}</p>
            )}

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={adding}
                className="flex-1 bg-white border-2 border-brand-500 text-brand-600 hover:bg-brand-50 font-semibold text-sm py-3 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {adding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : added ? (
                  "Added to Cart ✓"
                ) : (
                  "Add to Cart"
                )}
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-3 rounded-lg"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {moreFromRestaurant.length > 0 && (
          <RelatedRow title={`More from ${restaurant?.shopname || "this restaurant"}`} items={moreFromRestaurant} />
        )}

        {similarDishes.length > 0 && (
          <RelatedRow title={`Similar ${product.category?.name || "dishes"} you might like`} items={similarDishes} />
        )}
      </div>
    </div>
  );
}

function RelatedRow({ title, items }) {
  return (
    <section className="mt-10 pt-8 border-t">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <DishCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse max-w-5xl mx-auto px-4 pt-6">
      <div className="h-4 w-16 bg-gray-100 rounded mb-6" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square rounded-2xl bg-gray-100" />
        <div className="space-y-4">
          <div className="h-6 w-2/3 bg-gray-100 rounded" />
          <div className="h-4 w-1/3 bg-gray-100 rounded" />
          <div className="h-8 w-1/4 bg-gray-100 rounded" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}