import { Star, UserCircle2 } from "lucide-react";

export default function ReviewList({ reviews = [] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-gray-400 py-6 text-center">No reviews yet — be the first to review!</p>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {reviews.map((r) => (
        <div key={r._id} className="py-4 flex gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
            <UserCircle2 size={20} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 text-sm">{r.userId?.name || "Anonymous"}</span>
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                <Star size={10} fill="currentColor" /> {r.rating}
              </span>
            </div>
            {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
            <p className="text-[11px] text-gray-400 mt-1">
              {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
