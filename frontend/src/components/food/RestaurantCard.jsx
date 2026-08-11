import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import RatingBadge from "./RatingBadge";
import LikeButton from "./LikeButton";

export default function RestaurantCard({ restaurant }) {
  const {
    _id,
    shopname,
    coverImage,
    cuisines = [],
    avgRating,
    ratingCount,
    likesCount,
    isOpen,
  } = restaurant;

  return (
    <Link
      to={`/restaurant/${_id}`}
      className="group block rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-lg transition-shadow"
    >
      <div className="relative aspect-video bg-gray-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={shopname}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Store size={36} />
          </div>
        )}

        <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
          <LikeButton sellerId={_id} initialCount={likesCount} />
        </div>

        <div className="absolute bottom-2 left-2">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isOpen ? "bg-green-600 text-white" : "bg-gray-700 text-white"
            }`}
          >
            {isOpen ? "Open Now" : "Closed"}
          </span>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight line-clamp-1">{shopname}</h3>
          <RatingBadge rating={avgRating} count={ratingCount} />
        </div>

        {cuisines.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {cuisines.slice(0, 3).map((c) => (
              <span
                key={c}
                className="text-[11px] bg-brand-50 text-brand-600 font-medium px-2 py-0.5 rounded-full"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
