import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, UtensilsCrossed } from "lucide-react";
import api from "../../services/axios";
import RestaurantCard from "../../components/food/RestaurantCard";
import CuisineChips from "../../components/food/CuisineChips";

const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "likes", label: "Most Liked" },
  { value: "newest", label: "Newest" },
];

export default function Home() {
  const [urlParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(urlParams.get("search") || "");
  const [cuisine, setCuisine] = useState("");
  const [sort, setSort] = useState("rating");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/seller/restaurants", {
        params: { search: search || undefined, cuisine: cuisine || undefined, sort, page, limit: 12 },
      });
      setRestaurants(res.data?.data || []);
      setPagination(res.data?.pagination || null);
    } catch (err) {
      console.error(err);
      setError("Couldn't load restaurants. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, cuisine, sort, page]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, cuisine, sort]);

  return (
    <div className="bg-[#fffaf6] min-h-screen">
      {/* Hero / search band */}
      <section className="relative pt-8 pb-10 px-4 overflow-hidden max-h-[260px] md:max-h-[300px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-brand-500/90" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-white text-2xl md:text-4xl font-extrabold mb-2 drop-shadow-sm">
            Craving something delicious?
          </h1>
          <p className="text-white/90 text-sm md:text-base mb-6">
            Order from the best restaurants near you
          </p>

          <div className="flex items-center bg-white rounded-xl shadow-lg overflow-hidden max-w-xl mx-auto">
            <Search size={18} className="ml-4 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants or cuisines..."
              className="flex-1 px-3 py-3.5 text-sm outline-none"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CuisineChips selected={cuisine} onSelect={setCuisine} />
            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal size={15} className="text-gray-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border rounded-lg px-2.5 py-1.5 outline-none text-gray-700"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    Sort: {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <RestaurantGridSkeleton />
        ) : error ? (
          <p className="text-center text-red-500 py-16">{error}</p>
        ) : restaurants.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
              {restaurants.map((r) => (
                <RestaurantCard key={r._id} restaurant={r} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pb-14">
                <PageButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </PageButton>
                <span className="text-sm text-gray-500 px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <PageButton disabled={!pagination.hasMore} onClick={() => setPage((p) => p + 1)}>
                  Next
                </PageButton>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function PageButton({ children, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="px-3.5 py-1.5 text-sm font-medium border rounded-lg text-gray-700 disabled:opacity-40 hover:border-brand-400"
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <UtensilsCrossed className="mx-auto text-gray-300 mb-4" size={40} />
      <p className="text-gray-500 font-medium">No restaurants found</p>
      <p className="text-sm text-gray-400 mt-1">Try a different search or cuisine filter</p>
    </div>
  );
}

function RestaurantGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-10 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
          <div className="aspect-video bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}