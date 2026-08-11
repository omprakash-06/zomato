import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { useState } from "react";

export default function ProductCard({ product }) {
  return (
    <div className="group relative rounded-xl border bg-white p-3 transition-all hover:shadow-lg">

      {/* Image */}
      <Link to={`/product/${product._id}`} className="block overflow-hidden rounded-lg bg-gray-50">
        <img
          src={product.thumbnailImage}
          alt={product.name}
          // FIX: fallback if the image URL is broken/missing, avoids a
          // broken-image icon in the layout
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder-product.png";
          }}
          className="h-40 w-full object-contain transition duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="mt-3 space-y-1">
        <Link
          to={`/product/${product._id}`}
          className="line-clamp-1 text-sm font-semibold text-gray-800 hover:text-brand-600"
        >
          {product.name}
        </Link>

        {product.subtitle && (
          <p className="line-clamp-1 text-xs text-gray-500">{product.subtitle}</p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.actualPrice}
          </span>
          {product.price > product.actualPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.price}
            </span>
          )}
          {product.discount > 0 && (
            <span className="text-xs font-semibold text-green-600">
              {product.discount}% OFF
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 pt-0.5">
          <Star size={13} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium text-gray-700">
            {/* FIX: guard against non-numeric averageRating (e.g. null) */}
            {Number(product.averageRating || 0).toFixed(1)}
          </span>
          {product.ratingCount != null && (
            <span className="text-xs text-gray-400">
              ({product.ratingCount})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
