import { Star } from "lucide-react";

/**
 * Small reusable rating pill: ★ 4.3 (120)
 */
export default function RatingBadge({ rating = 0, count, size = "sm", className = "" }) {
  const rounded = Number(rating || 0).toFixed(1);
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const padding = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";

  const color =
    rating >= 4 ? "bg-green-600" : rating >= 3 ? "bg-brand-500" : "bg-gray-500";

  return (
    <span
      className={`inline-flex items-center gap-1 ${color} text-white font-semibold rounded-md ${padding} ${textSize} ${className}`}
    >
      <Star size={size === "sm" ? 11 : 13} fill="white" strokeWidth={0} />
      {rounded}
      {count != null && <span className="opacity-90 font-normal">({count})</span>}
    </span>
  );
}
