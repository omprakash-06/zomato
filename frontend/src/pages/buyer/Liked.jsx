import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/axios";
import RestaurantCard from "../../components/food/RestaurantCard";

export default function Liked() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/like/my")
      .then((res) => setRestaurants(res.data?.data || []))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Your Favorite Restaurants</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 bg-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="mx-auto text-gray-300 mb-4" size={40} />
          <p className="text-gray-500 font-medium">No favorites yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Tap the heart on a restaurant to save it here.</p>
          <Link to="/" className="text-brand-600 font-medium hover:underline">
            Start exploring restaurants
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map((r) => (
            <RestaurantCard key={r._id} restaurant={r} />
          ))}
        </div>
      )}
    </section>
  );
}
