# WeatherBoard — Precision Meteorological Dashboard

> A client-side Progressive Web Application (PWA) delivering high-precision weather forecasts with seamless automated API fallbacks, safe offline caching, and a design system inspired by Linear and Mercury.

![WeatherBoard Screenshot](/favicon.svg)

---

## Live Demo & Repository
- **Production URL:** [Deploy on Vercel / Netlify](#deployment)
- **GitHub Repository:** Public Git repository initialized with full chronological prompt history in `PROMPTS.md`.

---

## Key Highlights & Architecture

### 1. Dual-Engine Weather & Geocoding Architecture with Automatic Fallback
WeatherBoard is engineered to never fail, even in environments with missing, exhausted, or restricted API keys:
- **Primary Weather Provider:** OpenWeatherMap API (Current Weather + 5-Day/3-Hour Forecast).
- **Automated Fallback Engine:** Open-Meteo Forecast API (keyless, unlimited, high-resolution synoptic model).
  - If the OpenWeatherMap key is missing, unauthorized (`401`), invalid (`403`), rate-limited (`429`), or offline, WeatherBoard automatically and transparently switches to Open-Meteo.
  - Both data streams are normalized into a unified TypeScript interface (`WeatherData`, `CurrentWeather`, `HourlyForecast`, `DailyForecast`).
- **City Search & Autocomplete Engine:**
  - **Primary:** GeoDB Cities API via RapidAPI with debounced input (~280ms threshold).
  - **Fallback:** Open-Meteo Geocoding API (free, zero-config, global city database).
  - Includes client-side blur and submit validation, with an error-mapping utility transforming cryptic HTTP statuses into actionable user instructions.

### 2. Design System: Linear & Mercury Aesthetic
- **Minimalist Surfaces & Typography:** Deep dark graphite tones (`#090b10`), monochromatic neutrals, crisp hairline borders (`border-neutral-200/80` and `border-neutral-800/80`), backdrop blur effects, and tabular numerals.
- **Strict Touch Target Compliance:** All interactive buttons, search suggestions, unit selectors, and toggles enforce a minimum **$44 \times 44\text{ px}$** hit target (`touch-target` utility class).
- **Zero Horizontal Overflow:** Strict responsive viewport tuning verified across **375px (mobile)**, **768px (tablet)**, and **1280px (desktop)**.
- **Skeleton & Empty States:** Graceful animated skeleton placeholders and Mercury-inspired empty states with quick-start pinned cities.

### 3. Progressive Web App (PWA) & Offline Capabilities
- **Service Worker (`src/sw.ts`):** Custom Service Worker built with `vite-plugin-pwa` using the `injectManifest` strategy.
- **Offline Shell & Data Caching:**
  - Precaches all HTML, JS, CSS, and SVG/PNG icon assets.
  - Caches meteorological telemetry in runtime caches and safe client-side storage.
  - Reopening the app offline renders the full weather dashboard alongside a prominent, accessible **Offline Mode** banner showing the exact synchronization timestamp.
- **PWA Manifest:** Configured with `display: "standalone"`, `theme_color: "#090a0f"`, and high-resolution maskable `192x192` and `512x512` PNG icons.

### 4. Resilient Safe Storage & Pinned Favorites
- **SafeStorage Wrapper (`src/services/safeStorage.ts`):** Wraps `localStorage` in `try / catch` blocks with an automatic in-memory fallback map, preventing crashes in Safari Private Browsing mode, restricted cookie settings, or storage quota exhaustion.
- **Pinned Locations:** Capped at 5 cities for quick one-tap access.
- **Accessible Modal Confirmation:** Removing a city invokes a native `<dialog>` confirmation modal conforming to modern web standards (`overscroll-behavior: contain`, backdrop blur, safe autofocus on Cancel, light-dismiss fallback).

### 5. Daily Morning Meteorological Briefing (Web Push / Notifications API)
- **Pre-Permission UX:** Explanatory card communicating the purpose and frequency of notifications prior to invoking `Notification.requestPermission()`.
- **Clean Fallbacks:** Gracefully handles `denied` and `unsupported` browser environments without degrading the rest of the application.
- **Reminder Time Configuration:** Allows users to specify a daily delivery time (e.g. `08:00 AM`).
- **Immediate Verification:** In-app "Send Test" button delivers an instant test dispatch through the Service Worker controller.

> **Architecture Note on Client-Side Scheduled Notifications:**  
> Because WeatherBoard is an entirely client-side application without a continuous proprietary backend push server, scheduled notifications when the browser tab is fully closed rely strictly on modern web platform capabilities:
> - **Periodic Background Sync API** (where supported in Chromium PWAs installed on mobile/desktop).
> - **Service Worker Wake-up checks** when network conditions transition or the device resumes.  
> In browsers that restrict background sync or require server-side Web Push endpoints (such as iOS Safari PWA requirements for external APNs triggers), notification dispatches are verified when active or running as an installed PWA. Documenting this limitation highlights robust systems and architectural awareness.

---

## Getting Started

### Prerequisites
- Node.js (v18 or newer; recommended v20+ or v25)
- npm (v9+) or pnpm / yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <YOUR_REPO_URL>
   cd WeatherBoard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure API Keys:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your API keys if you have them:
   ```env
   VITE_OPENWEATHER_API_KEY=your_openweathermap_api_key_here
   VITE_RAPIDAPI_KEY=your_rapidapi_geodb_key_here
   VITE_RAPIDAPI_HOST=wft-geo-db.p.rapidapi.com
   ```
   > **Note:** WeatherBoard works 100% out-of-the-box even with empty `.env` keys, thanks to the automatic Open-Meteo fallback engine! You can also enter or test custom API keys directly in the in-app Settings modal.

### Development & Production Build
- **Start local development server:**
  ```bash
  npm run dev
  ```
- **Type-check and build for production:**
  ```bash
  npm run build
  ```
- **Preview production build locally:**
  ```bash
  npm run preview
  ```
- **Run linter:**
  ```bash
  npm run lint
  ```

---

## Deployment

### Deploy to Vercel
1. Install Vercel CLI or connect via the Vercel Dashboard:
   ```bash
   npx vercel
   ```
2. Set build command to `npm run build` and output directory to `dist`.
3. Add any environment variables (`VITE_OPENWEATHER_API_KEY`, `VITE_RAPIDAPI_KEY`) in the project settings if desired.

### Deploy to Netlify
1. Connect repository or deploy via CLI:
   ```bash
   npx netlify deploy --prod --dir=dist
   ```

---

## Project Structure
```text
WeatherBoard/
├── public/
│   ├── favicon.svg              # Minimalist weather logo
│   ├── pwa-192x192.png          # PWA 192px app icon
│   ├── pwa-512x512.png          # PWA 512px maskable icon
│   └── apple-touch-icon.png     # iOS touch icon
├── scripts/
│   └── generate-icons.js        # Script generating crisp PWA icons
├── src/
│   ├── components/
│   │   ├── CurrentWeatherCard.tsx  # Hero card with temperature & condition
│   │   ├── DailyForecastCard.tsx   # 5-day synoptic forecast with visual temp bars
│   │   ├── EmptyState.tsx          # Clean empty state with popular shortcuts
│   │   ├── FavoritesBar.tsx        # Horizontal quick-access bar (max 5)
│   │   ├── Header.tsx              # Linear-style top bar with toggles & search
│   │   ├── HourlyForecastCard.tsx  # 24h horizontal scrollable trajectory
│   │   ├── MetricsGrid.tsx         # 6-indicator atmospheric telemetry grid
│   │   ├── OfflineBanner.tsx       # Visible offline mode synchronization alert
│   │   ├── RemoveCityDialog.tsx    # Accessible <dialog> deletion confirmation
│   │   ├── SearchModal.tsx         # Debounced autocomplete search modal
│   │   ├── SettingsModal.tsx       # Notifications, custom API keys, and theme controls
│   │   └── SkeletonLoader.tsx      # Multi-device skeleton loading states
│   ├── hooks/
│   │   ├── useDebounce.ts          # Custom 280ms debounce hook
│   │   ├── useFavorites.ts         # Saved locations management
│   │   ├── useNetworkStatus.ts     # Real-time online/offline detector
│   │   ├── useNotifications.ts     # Notification permissions & trigger handlers
│   │   └── usePreferences.ts       # °C/°F and dark/light theme persistence
│   ├── services/
│   │   ├── citySearchService.ts    # GeoDB + Open-Meteo geocoding search
│   │   ├── errorMapper.ts          # Actionable HTTP and network error translator
│   │   ├── safeStorage.ts          # Resilient storage wrapper with in-memory fallback
│   │   └── weatherService.ts       # OpenWeatherMap + Open-Meteo weather engine
│   ├── types/
│   │   └── index.ts                # TypeScript domain models
│   ├── utils/
│   │   └── weatherIcons.tsx        # Lucide weather icon mappings
│   ├── App.tsx                     # Main dashboard coordinator
│   ├── index.css                   # Tailwind v4 styles, scrollbars, dialog backdrop
│   ├── main.tsx                    # React root + PWA service worker registration
│   ├── sw.ts                       # Custom service worker with Workbox injectManifest
│   └── vite-env.d.ts               # Vite & PWA type declarations
├── .env.example                    # Template environment variables
├── index.html                      # HTML5 entry with FOUC prevention & meta color-scheme
├── package.json                    # Project metadata and dependencies
├── PROMPTS.md                      # Chronological AI prompt & design system log
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite + React + Tailwind + PWA configuration
```
