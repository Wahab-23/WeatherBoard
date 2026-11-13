# AI Development Prompts Log — WeatherBoard

**IDE / Assistant Platform:** Google Antigravity (Gemini 3.8 Flash / Medium)  
**Project:** WeatherBoard PWA (Frontend Engineering Challenge)  
**Date:** November 13, 2026  

---

## Chronological Prompt Log

### Prompt 1: Initial Specification & Project Kickoff
**User Prompt:**
```text
Can you build this?

Phase 0: Setup & API Preparation (30 Mins)
Acquire API Keys:
- Sign up for a free OpenWeatherMap API key (Current Weather + 5-Day/3-Hour Forecast endpoints).
- Subscribe to the free tier of GeoDB Cities API on RapidAPI.
- Initialize the Project: Scaffold a client-side SPA using Vite + React + TypeScript + Tailwind CSS (faster and cleaner for a pure client-side PWA than a full-stack framework).
- Initialize your public GitHub repository immediately and create PROMPTS.md to record your IDE choice (Cursor, Antigravity, or OpenCode) and every prompt you run.
- Configure .env (and .env.example for the repo) for your API keys.

Phase 1: UI Foundation & Layout Shell (45 Mins)
Goal: Avoid generic AI boilerplate by defining a tight design system inspired by Linear and Mercury (clean typography, subtle borders, clear status badges, calm dark/light surfaces).
Agent Prompt Focus:
- Generate a responsive layout shell supporting 375px (mobile), 768px (tablet), and 1280px (desktop) with zero horizontal overflow.
- Enforce minimum 44x44 px touch targets on all interactive buttons, search items, and toggles.
- Build skeleton loading states and clean empty states before wiring up live APIs.

Phase 2: Search, Validation & Weather Engine (1.5 Hours)
Debounced Autocomplete (GeoDB Cities):
- Implement a custom debounce hook (~250ms–300ms pause threshold) so suggestions appear within 300ms.
- Display explicit UI states for: loading suggestions, no matching cities found, and API/rate-limit errors.
- Client-Side Form Validation: Validate on blur as well as submit.
- Create an error-mapping utility that translates HTTP/network failures into actionable instructions (e.g., "Search service rate limit reached—try again in a few seconds" or "City name cannot be empty—enter at least 2 characters"), avoiding generic error text.
- Weather Service with Automatic Fallback:
  - Fetch current weather + 5-day forecast from OpenWeatherMap.
  - Build an automatic fallback wrapper that seamlessly switches to Open-Meteo (which requires no key) if OpenWeatherMap fails or rate-limits, normalizing both responses into a single TypeScript interface.

Phase 3: Favourites & High-ROI Polish (45 Mins)
Saved Cities (localStorage):
- Create a safe storage wrapper (try/catch around localStorage access) so the app degrades gracefully in private browsing or restricted storage environments.
- Cap saved cities at 5, render a quick-access bar/sidebar, and add a confirmation dialog/popover before removing a city.
- Quick Bonus Features (High visual impact, low effort):
  - Add a °C / °F unit toggle persisted in storage that recalculates values immediately without re-fetching.
  - Add a dark/light mode toggle with prefers-color-scheme detection.

Phase 4: PWA, Offline Mode & Notifications (1.5 Hours)
Manifest & Service Worker:
- Use vite-plugin-pwa with the injectManifest strategy so you can write a custom Service Worker (sw.ts).
- Configure manifest.json with display: "standalone", theme_color, and proper 192x192 and 512x512 PNG icons.
- Cache the app shell (HTML/JS/CSS/icons) and store the last-viewed city's weather payload so reopening the app offline renders full weather data alongside a visible "Offline Mode" banner.
- Daily Morning Reminder (Web Push / Notifications API):
  - Build a pre-permission UI card explaining why notifications are useful before triggering Notification.requestPermission().
  - Handle denied and unsupported browser states cleanly without breaking the rest of the settings UI.
  - Allow the user to pick a daily reminder time.
- Architecture Note for README:
  - Document client-side scheduled notifications limitations when closed (no backend push server).

Phase 5: Testing, Deployment & Submission (45 Mins)
- Verification Checklist: 375px, 768px, 1280px viewports, offline simulation, safe storage failure mode, Lighthouse PWA audit.
- Deploy to Vercel/Netlify with HTTPS URL.
- Complete README.md and PROMPTS.md.
```

**Antigravity Plan & Execution:**
- Consult modern web standards (`modern-web-guidance`) for dark mode toggles (`<meta name="color-scheme">`), native accessible `<dialog>` modals with `overscroll-behavior: contain` and light dismiss fallback, accessible 44x44px touch targets, and resilient local storage wrapping.
- Scaffold Vite + React + TypeScript + Tailwind CSS client-side SPA.
- Set up `.env` and `.env.example` supporting both API keys with instant fallback to Open-Meteo (Weather and Geocoding) for 100% turnkey functionality even with empty keys or rate limits.
- Build Linear/Mercury aesthetic: monochromatic neutrals, refined borders (`border-neutral-200 dark:border-neutral-800`), backdrop blurs, crisp status badges, zero horizontal overflow across 375px, 768px, 1280px.
- Implement robust custom Service Worker (`sw.ts`) with `injectManifest`, caching app shell and last weather payload in IndexedDB/CacheStorage, displaying an active Offline Mode banner.
- Build notification pre-permission card, graceful permission states (granted/denied/unsupported), time selector, and background reminder checks.

---

### Prompt 2: Fix Dark Mode Toggle in Tailwind CSS v4
**User Prompt:**
```text
Dark mode toggle not working.
```

**Antigravity Root Cause Analysis & Resolution:**
- **Root Cause:** In Tailwind CSS v4, the default `@import "tailwindcss";` compiles the `dark:` variant using `@media (prefers-color-scheme: dark)`. Even though JavaScript was correctly toggling the `dark` class on `document.documentElement` (`<html class="dark">`) and updating `<meta name="color-scheme">`, Tailwind v4 ignored the class name because it was bound strictly to the operating system's media query.
- **Resolution:**
  - Added `@custom-variant dark (&:where(.dark, .dark *));` to `src/index.css`.
  - Recompiled CSS; confirmed that `dark:` utilities now target `:where(.dark, .dark *)` and respond immediately to class toggles.
  - Created and executed automated browser verification (`scripts/test-dark-mode.js`) with Puppeteer:
    - Click 1: Body switched from `rgb(9, 11, 16)` (dark) to `oklch(0.985 0 none)` (light); `html.className` cleared.
    - Click 2: Body switched back to `rgb(9, 11, 16)` (dark); `html.className` restored to `dark`.
    - Settings Modal: Tested 3-state radio controls ("Light", "Dark", "Auto"); confirmed DOM styles update in real-time.
