# Foodly Frontend — Run Locally (VS Code)

## What changed vs the old coder.op frontend
- Full Zomato-style rebrand: colors, fonts, "Foodly" branding
- New pages: Restaurant listing (Home), Restaurant Detail (menu + reviews + like), Liked/Favorites
- New components: RestaurantCard, RatingBadge, LikeButton, CuisineChips, MenuItemCard, ReviewList, ReviewForm, OrderStatusStepper
- Seller "Products" renamed to "Menu" — with Veg/Non-Veg + Available/Out-of-stock toggles
- Seller "Shop Settings" extended — cuisines, description, opening/closing time, cover image, open/closed toggle
- Cart, Checkout, My Orders, Order Details — reused from the old project, restyled, broken `/products` links fixed
- Admin panel — reused as-is (not restyled, still functional)

## 1. Install dependencies
```bash
cd frontend
npm install
```

## 2. Environment variables
Copy `.env.example` to `.env` and confirm the backend URL:
```bash
cp .env.example .env
```
```
VITE_API_URL=http://localhost:3000/api
```
Make sure this matches wherever your backend is actually running (localhost while testing, your deployed backend URL once you deploy).

## 3. Run dev server
```bash
npm run dev
```
Opens at `http://localhost:5173` by default.

## 4. Before you can see restaurants on the Home page
The listing only shows **approved** restaurants. Flow to get test data showing:
1. Register a normal user → apply as seller (`/seller/registration`) → fills shopname/phone/address/documents
2. Login as Admin (Postman or `/admin/login` page) → approve that seller (`PUT /admin/seller/:id/approve`)
3. Login as that seller → go to **Restaurant Profile** (`/seller/shop-settings`) → fill cuisines, cover image, opening/closing time → Save (restaurants without a cover image will still show, just with a placeholder icon)
4. Go to **Menu** (`/seller/menu`) → Add a few menu items, mark them Available
5. Go back to Home (`/`) as a buyer — the restaurant should now appear in the listing

## 5. Build for production (before deploying)
```bash
npm run build
```
Output goes to `frontend/dist/` — this is what you deploy (Vercel/Netlify/etc.), or serve via `npm run preview` to sanity check locally first.

## 6. Deploying
- **Vercel**: a `vercel.json` is already included. Just import the `frontend` folder as a project, set the `VITE_API_URL` environment variable in Vercel's dashboard to your deployed backend's URL (e.g. `https://your-backend.onrender.com/api`), and deploy.
- Whatever you deploy the backend to, **update `FRONTEND_URL` in the backend's `.env`** to your deployed frontend URL (needed for CORS to work) — this was set up in the backend already, just needs the real value once both are live.

## Known trade-offs (given the deadline)
- Admin panel wasn't restyled — it's functional but still looks like the old e-commerce admin. Fine for a CTO demo since admin isn't the focus.
- Order tracking uses a simple, static status display on the Order Details page (not the fully separate animated page from the reference image) — still shows all 4 stages clearly.
- Seller Dashboard chart/graph shown in the reference image wasn't added — stat cards (revenue, orders, menu items) are there instead, which covers the same information faster to ship.
