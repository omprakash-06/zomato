import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import api from "../../services/axios";
import { getErrorMessage } from "../../utils/getErrorMessage";

/**
 * Renders a star-rating + comment form.
 * Props:
 *   orderId    - the delivered order this review is for
 *   onSubmitted(review) - callback after successful submit
 */
export default function ReviewForm({ orderId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post("/review", { orderId, rating, comment });
      setDone(true);
      onSubmitted?.(res.data?.data);
    } catch (err) {
      setError(getErrorMessage(err, err?.response?.data?.message));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-green-50 text-green-700 text-sm rounded-xl px-4 py-3">
        Thanks for your review! 🎉
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-100 rounded-xl p-4">
      <p className="text-sm font-medium text-gray-900 mb-2">Rate your order</p>
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(n)}
          >
            <Star
              size={26}
              className={(hoverRating || rating) >= n ? "text-brand-500 fill-brand-500" : "text-gray-200"}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was the food and delivery? (optional)"
        rows={3}
        maxLength={500}
        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-500"
      />
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-lg flex items-center gap-2"
      >
        {submitting && <Loader2 size={14} className="animate-spin" />}
        Submit Review
      </button>
    </form>
  );
}
