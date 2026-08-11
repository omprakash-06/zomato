import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Clock, Store, ChevronLeft } from "lucide-react";
import api from "../../services/axios";
import RatingBadge from "../../components/food/RatingBadge";
import LikeButton from "../../components/food/LikeButton";
import MenuItemCard from "../../components/food/MenuItemCard";
import ReviewList from "../../components/food/ReviewList";

export default function RestaurantDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("menu"); // "menu" | "reviews"
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [detailRes, likeRes] = await Promise.allSettled([
          api.get(`/seller/restaurants/${id}`),
          api.get(`/like/${id}/status`),
        ]);

        if (cancelled) return;

        if (detailRes.status === "fulfilled") {
          setData(detailRes.value.data?.data || null);
        } else {
          setError("Restaurant not found.");
        }

        if (likeRes.status === "fulfilled") {
          setLiked(!!likeRes.value.data?.liked);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (error || !data) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 mb-4">{error || "Something went wrong."}</p>
        <Link to="/" className="text-brand-600 font-medium hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const { restaurant, menu = [], recentReviews = [] } = data;

  // group menu items by category name
  const groups = menu.reduce((acc, item) => {
    const cat = item.category?.name || "Menu";
    (acc[cat] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="bg-[#fffaf6] min-h-screen pb-16">
      {/* Cover */}
      <div className="relative h-56 md:h-72 bg-gray-200">
        {restaurant.coverImage ? (
          <img src={restaurant.coverImage} alt={restaurant.shopname} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Store size={48} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <Link
          to="/"
          className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full p-2 hover:bg-white"
        >
          <ChevronLeft size={18} />
        </Link>

        <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
          <LikeButton sellerId={id} initialLiked={liked} initialCount={restaurant.likesCount} />
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-white text-2xl md:text-3xl font-extrabold">{restaurant.shopname}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <RatingBadge rating={restaurant.avgRating} count={restaurant.ratingCount} size="md" />
            {restaurant.cuisines?.map((c) => (
              <span key={c} className="text-xs bg-white/90 text-gray-800 font-medium px-2 py-1 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Info row */}
        <div className="bg-white rounded-xl shadow-sm -mt-6 relative p-4 flex flex-wrap gap-4 text-sm text-gray-600">
          {restaurant.address && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-brand-500" />
              {[restaurant.address.city, restaurant.address.state].filter(Boolean).join(", ") || "Address on file"}
            </span>
          )}
          {(restaurant.openingTime || restaurant.closingTime) && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-brand-500" />
              {restaurant.openingTime || "--"} – {restaurant.closingTime || "--"}
            </span>
          )}
          <span
            className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${
              restaurant.isOpen ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {restaurant.isOpen ? "Open Now" : "Closed"}
          </span>
        </div>

        {restaurant.description && (
          <p className="text-sm text-gray-500 mt-4">{restaurant.description}</p>
        )}

        {/* Tabs */}
        <div className="flex gap-6 border-b mt-6">
          <TabButton active={tab === "menu"} onClick={() => setTab("menu")}>
            Menu ({menu.length})
          </TabButton>
          <TabButton active={tab === "reviews"} onClick={() => setTab("reviews")}>
            Reviews ({restaurant.ratingCount || 0})
          </TabButton>
        </div>

        {tab === "menu" ? (
          menu.length === 0 ? (
            <p className="text-center text-gray-400 py-16">No menu items available right now.</p>
          ) : (
            Object.entries(groups).map(([catName, items]) => (
              <div key={catName} className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-1">{catName}</h3>
                <div>
                  {items.map((item) => (
                    <MenuItemCard key={item._id} item={item} />
                  ))}
                </div>
              </div>
            ))
          )
        ) : (
          <div className="mt-4">
            <ReviewList reviews={recentReviews} />
            <p className="text-xs text-gray-400 text-center mt-4">
              You can leave a review from your order history once it's delivered.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 text-sm font-semibold border-b-2 -mb-px ${
        active ? "border-brand-500 text-brand-600" : "border-transparent text-gray-400"
      }`}
    >
      {children}
    </button>
  );
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-56 md:h-72 bg-gray-200" />
      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-4">
        <div className="h-20 bg-gray-100 rounded-xl" />
        <div className="h-6 w-32 bg-gray-100 rounded" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
