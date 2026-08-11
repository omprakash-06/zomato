import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import api from "../../services/axios";
import { useAuth } from "../../context/authContext";

/**
 * Heart icon that toggles like/unlike for a restaurant.
 * Props:
 *   sellerId       - restaurant id (required)
 *   initialLiked   - boolean, optional starting state
 *   initialCount   - number, optional starting like count
 *   size           - icon px size
 *   onChange({liked, likesCount}) - optional callback
 */
export default function LikeButton({ sellerId, initialLiked = false, initialCount, size = 18, className = "" }) {
  const { isLoggedIn } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => setLiked(initialLiked), [initialLiked]);
  useEffect(() => setCount(initialCount), [initialCount]);

  async function handleToggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    if (busy) return;
    setBusy(true);

    // optimistic update
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => (c == null ? c : c + (nextLiked ? 1 : -1)));
    setPop(true);
    setTimeout(() => setPop(false), 350);

    try {
      const res = await api.post(`/like/${sellerId}/toggle`);
      const data = res.data;
      setLiked(data.liked);
      if (data.likesCount != null) setCount(data.likesCount);
    } catch (err) {
      // revert on failure
      setLiked(!nextLiked);
      setCount((c) => (c == null ? c : c - (nextLiked ? 1 : -1)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={liked ? "Remove from favorites" : "Add to favorites"}
      className={`inline-flex items-center gap-1 shrink-0 ${className}`}
    >
      <Heart
        size={size}
        className={`${pop ? "like-pop" : ""} transition-colors ${
          liked ? "text-brand-500 fill-brand-500" : "text-white fill-black/20"
        }`}
        strokeWidth={2}
      />
      {count != null && <span className="text-xs text-gray-600">{count}</span>}
    </button>
  );
}
