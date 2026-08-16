import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, UtensilsCrossed, Leaf } from "lucide-react";
import api from "../../services/axios";
import RestaurantCard from "../../components/food/RestaurantCard";
import DishCard from "../../components/food/DishCard";
import CuisineChips from "../../components/food/CuisineChips";

const RESTAURANT_SORTS = [
  { value: "rating", label: "Top Rated" },
  { value: "likes", label: "Most Liked" },
  { value: "newest", label: "Newest" },
];

const DISH_SORTS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function Home() {
  const [urlParams, setUrlParams] = useSearchParams();
  const [tab, setTab] = useState(urlParams.get("tab") === "dishes" ? "dishes" : "restaurants"); // "restaurants" | "dishes"

  const [search, setSearch] = useState(urlParams.get("search") || "");

  function changeTab(nextTab) {
    setTab(nextTab);
    setUrlParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", nextTab);
        return next;
      },
      { replace: true }
    );
  }

  // ── Restaurants state ──
  const [restaurants, setRestaurants] = useState([]);
  const [restLoading, setRestLoading] = useState(true);
  const [restError, setRestError] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [restSort, setRestSort] = useState("rating");
  const [restPage, setRestPage] = useState(1);
  const [restPagination, setRestPagination] = useState(null);

  // ── Dishes state ──
  const [dishes, setDishes] = useState([]);
  const [dishLoading, setDishLoading] = useState(true);
  const [dishError, setDishError] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [dishSort, setDishSort] = useState("newest");
  const [dishPage, setDishPage] = useState(1);
  const [dishPagination, setDishPagination] = useState(null);

  const fetchRestaurants = useCallback(async () => {
    setRestLoading(true);
    setRestError("");
    try {
      const res = await api.get("/seller/restaurants", {
        params: { search: search || undefined, cuisine: cuisine || undefined, sort: restSort, page: restPage, limit: 12 },
      });
      setRestaurants(res.data?.data || []);
      setRestPagination(res.data?.pagination || null);
    } catch (err) {
      console.error(err);
      setRestError("Couldn't load restaurants. Please try again.");
    } finally {
      setRestLoading(false);
    }
  }, [search, cuisine, restSort, restPage]);

  const fetchDishes = useCallback(async () => {
    setDishLoading(true);
    setDishError("");
    try {
      const res = await api.get("/product", {
        params: {
          search: search || undefined,
          isVeg: vegOnly ? "true" : undefined,
          sort: dishSort,
          page: dishPage,
          limit: 12,
        },
      });
      setDishes(res.data?.data || []);
      setDishPagination(res.data?.pagination || null);
    } catch (err) {
      console.error(err);
      setDishError("Couldn't load dishes. Please try again.");
    } finally {
      setDishLoading(false);
    }
  }, [search, vegOnly, dishSort, dishPage]);

  // fetch whichever tab is active
  useEffect(() => {
    if (tab === "restaurants") fetchRestaurants();
    else fetchDishes();
  }, [tab, fetchRestaurants, fetchDishes]);

  // reset both pages to 1 whenever the shared search box changes
  useEffect(() => {
    setRestPage(1);
    setDishPage(1);
  }, [search]);

  return (
    <div className="bg-[#fffaf6] min-h-screen">
      {/* Hero / search band */}
      <section className="relative pt-8 pb-10 px-4 overflow-hidden max-h-65 md:max-h-75">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/50 to-brand-500/90" />
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
              placeholder={tab === "restaurants" ? "Search restaurants or cuisines..." : "Search for a dish..."}
              className="flex-1 px-3 py-3.5 text-sm outline-none"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-6">
        {/* Tabs: Restaurants vs Dishes */}
        <div className="flex gap-6 border-b mb-6">
          <TabButton active={tab === "restaurants"} onClick={() => changeTab("restaurants")}>
            Restaurants
          </TabButton>
          <TabButton active={tab === "dishes"} onClick={() => changeTab("dishes")}>
            Dishes
          </TabButton>
        </div>

        {tab === "restaurants" ? (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <CuisineChips selected={cuisine} onSelect={setCuisine} />
                <div className="flex items-center gap-2 shrink-0">
                  <SlidersHorizontal size={15} className="text-gray-400" />
                  <select
                    value={restSort}
                    onChange={(e) => setRestSort(e.target.value)}
                    className="text-sm border rounded-lg px-2.5 py-1.5 outline-none text-gray-700"
                  >
                    {RESTAURANT_SORTS.map((o) => (
                      <option key={o.value} value={o.value}>
                        Sort: {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {restLoading ? (
              <GridSkeleton />
            ) : restError ? (
              <p className="text-center text-red-500 py-16">{restError}</p>
            ) : restaurants.length === 0 ? (
              <EmptyState label="No restaurants found" />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
                  {restaurants.map((r) => (
                    <RestaurantCard key={r._id} restaurant={r} />
                  ))}
                </div>

                {restPagination && restPagination.totalPages > 1 && (
                  <Pager pagination={restPagination} onPrev={() => setRestPage((p) => p - 1)} onNext={() => setRestPage((p) => p + 1)} />
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setVegOnly((v) => !v)}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border ${
                  vegOnly ? "bg-green-50 border-green-500 text-green-700" : "border-gray-200 text-gray-600"
                }`}
              >
                <Leaf size={14} />
                Veg Only
              </button>

              <select
                value={dishSort}
                onChange={(e) => setDishSort(e.target.value)}
                className="text-sm border rounded-lg px-2.5 py-2 outline-none text-gray-700 ml-auto"
              >
                {DISH_SORTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    Sort: {o.label}
                  </option>
                ))}
              </select>
            </div>

            {dishLoading ? (
              <DishGridSkeleton />
            ) : dishError ? (
              <p className="text-center text-red-500 py-16">{dishError}</p>
            ) : dishes.length === 0 ? (
              <EmptyState label={search ? `No dishes found for "${search}"` : "No dishes available right now"} />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
                  {dishes.map((item) => (
                    <DishCard key={item._id} item={item} />
                  ))}
                </div>

                {dishPagination && dishPagination.totalPages > 1 && (
                  <Pager pagination={dishPagination} onPrev={() => setDishPage((p) => p - 1)} onNext={() => setDishPage((p) => p + 1)} />
                )}
              </>
            )}
          </>
        )}
      </section>
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

function Pager({ pagination, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-center gap-2 pb-14">
      <PageButton disabled={pagination.page <= 1} onClick={onPrev}>
        Prev
      </PageButton>
      <span className="text-sm text-gray-500 px-2">
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <PageButton disabled={!pagination.hasMore} onClick={onNext}>
        Next
      </PageButton>
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

function EmptyState({ label }) {
  return (
    <div className="text-center py-20">
      <UtensilsCrossed className="mx-auto text-gray-300 mb-4" size={40} />
      <p className="text-gray-500 font-medium">{label}</p>
      <p className="text-sm text-gray-400 mt-1">Try a different search or filter</p>
    </div>
  );
}

function GridSkeleton() {
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

function DishGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-10 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
          <div className="h-36 bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-100 rounded w-4/5" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}