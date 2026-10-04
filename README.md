# Holiday in New York — 3D Times Square & Package Booking Experience

A festive, production-ready New York holiday travel and package booking web application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Three.js**, **jsPDF**, and **QRCode**.

Featuring an interactive **360° Times Square 3D panoramic hero** with clickable landmark hotspots, a multi-step **holiday booking flow** with real-time price calculations and localStorage state persistence, downloadable **high-resolution PDF e-tickets**, `.ics` calendar sync, and full-bleed real photography of New York during the holidays.

---

## 1. Quick Start & How to Run

### Prerequisites
- Node.js 18+ and npm / pnpm / yarn

### Installation & Development
```bash
# 1. Install dependencies
npm install

# 2. Start the local Vite development server
npm run dev

# 3. Open in your browser
http://localhost:3000
```

### Production Build
```bash
# Compile and build production assets
npm run build

# Preview production build locally
npm run preview
```

---

## 2. How to Swap the 360° Times Square Panorama

The 3D hero uses an equirectangular spherical projection rendered via Three.js. You can easily swap the panoramic photo with your own photography.

### Steps to Swap:
1. **Prepare your 360° photo:**
   - **Projection:** Equirectangular projection (full 360° horizontal $\times$ 180° vertical).
   - **Recommended resolution:** **8192×4096 px** (for high-end desktop clarity) or **4096×2048 px** (optimal balance between download speed and visual fidelity).
   - **Aspect Ratio:** Strictly **2:1** (width must be exactly twice the height).
   - **Format:** JPEG or WebP, compressed to between 1.5MB – 3.5MB.
2. **Place the file or update the URL:**
   - **Option A (Local file):** Place your image in `/public/assets/images/times_square_360.jpg`.
   - **Option B (Remote URL):** Open `src/components/Panorama360.tsx` and update the constant:
     ```typescript
     const TIMES_SQUARE_PANORAMA_URL = '/assets/images/times_square_360.jpg';
     // or your hosted CDN URL:
     // const TIMES_SQUARE_PANORAMA_URL = 'https://your-domain.com/panorama.jpg';
     ```
3. **Hotspot Alignment:**
   - In `src/data/packages.json`, each package has a `hotspot` property with `yaw` (-180° to 180°) and `pitch` (-90° to 90°).
   - Adjust `yaw` to rotate the hotspot horizontally to point at specific neon signs or buildings in your custom panorama.

---

## 3. How to Add or Modify Holiday Packages

All holiday packages are stored centrally in a single JSON file:
📂 **`/src/data/packages.json`**

### Package Schema Structure:
```json
{
  "id": "unique-slug-id",
  "name": "Package Display Title",
  "tagline": "Short evocative subtitle",
  "category": "Iconic Landmarks | Festive Broadway | Romantic Winter | Family Holiday",
  "price": 549,
  "originalPrice": 699,
  "duration": "4 Days / 3 Nights",
  "rating": 4.95,
  "reviewCount": 184,
  "featured": true,
  "badge": "Bestseller",
  "image": "https://images.unsplash.com/photo-...",
  "imageCredit": {
    "photographer": "Photographer Name",
    "source": "Unsplash",
    "url": "https://unsplash.com/..."
  },
  "hotspot": {
    "id": "hotspot-unique-id",
    "title": "Landmark Name (e.g. Broadway Theater District)",
    "yaw": -35,
    "pitch": 8,
    "distance": 450
  },
  "description": "Full promotional overview of the holiday package...",
  "highlights": [
    "Prime Orchestra ticket to top Broadway production",
    "Guided walking history tour",
    "Pre-theater 3-course dinner"
  ],
  "includedAmenities": [
    "Dedicated concierge support",
    "Digital mobile pass with instant check-in"
  ]
}
```

Simply add a new object to the array in `packages.json` and it will automatically populate:
- The 3D Panorama's clickable hotspots
- The Packages Showcase section with filtering
- The 6-step interactive booking selector
- The generated PDF ticket and printable vouchers

---

## 4. Deliverables

### A. List of Files Modified / Created
- `index.html` — Updated title, SEO metadata, and Google Fonts (`Playfair Display`, `Plus Jakarta Sans`, `Cinzel`).
- `metadata.json` — Configured official title and description.
- `src/index.css` — Configured custom holiday colors (navy, gold, cranberry, snow), print media stylesheets, and accessibility rules.
- `src/types.ts` — Comprehensive TypeScript definitions for packages, add-ons, traveler info, and confirmed bookings.
- `src/data/packages.json` — Single JSON file defining all 6 holiday packages, real photo credits, and 3D spherical hotspot coordinates.
- `src/data/addOns.ts` — Add-on items (hotel upgrade, Broadway orchestra seats, airport SUV transfer) and promo codes (`NYC2026`, `HOLIDAY25`).
- `src/components/Panorama360.tsx` — Three.js 360° equirectangular panoramic hero viewer with raycasting, interactive 3D hotspot pins, auto-rotation, pinch/zoom, loading states, and 2.5D parallax fallback.
- `src/components/BookingFlow.tsx` — 6-step booking flow with calendar date validation, live price recalculations, inline validation, and localStorage draft saving.
- `src/components/TicketModal.tsx` — E-ticket viewer with jsPDF downloadable ticket generation, real QR code rendering, `.ics` calendar generator, and print view.
- `src/components/MyBookings.tsx` — Trip management page for reviewing confirmed bookings, re-downloading tickets, and cancelling test reservations.
- `src/components/PhotoShowcase.tsx` — Full-bleed photography gallery featuring real NYC holiday landmarks with photographer credits.
- `src/components/SnowEffect.tsx` — Lightweight canvas falling snow particle animation with `prefers-reduced-motion` compliance and user toggle.
- `src/components/Navigation.tsx` — Sticky navbar with brand display, desktop links, booking count badge, snow toggle, and accessible mobile drawer.
- `src/components/Footer.tsx` — Complete footer with legal disclosures, concierge contact, and licensed photography attributions.
- `src/components/FaqSection.tsx` — Accordion answering common guest questions on weather, Broadway tickets, and cancellation.
- `src/components/NotFound.tsx` — Custom 404 error page.
- `src/App.tsx` — Unified application hub orchestrating view navigation, scroll-spy, and booking modals.
- `README.md` — Complete developer guide, photo checklist, and test plan.

---

### B. Recommended Photo Assets Checklist
To replace default photography with your own files, place them in `/public/assets/images/` using these recommended specifications:

| Asset Name | Recommended Resolution | Aspect Ratio | Target Placement |
|:---|:---|:---|:---|
| **Times Square 360° Panorama** | **8192 × 4096 px** (min 4096×2048) | **2:1** | Hero 3D Spherical Texture (`Panorama360.tsx`) |
| **Rockefeller Center Tree & Rink** | 2400 × 1600 px | 3:2 or 16:9 | Package 1 & Showcase Banner |
| **Central Park in Winter (Bow Bridge)** | 2400 × 1600 px | 3:2 or 16:9 | Package 2 & Showcase Banner |
| **Broadway Marquee at Night** | 2400 × 1600 px | 3:2 or 16:9 | Package 3 & Showcase Banner |
| **Statue of Liberty Holiday Harbor** | 2400 × 1600 px | 3:2 or 16:9 | Package 4 & Showcase Banner |
| **Empire State Building at Night** | 2400 × 1600 px | 3:2 or 16:9 | Package 5 & Showcase Banner |
| **Fifth Avenue Holiday Windows** | 2400 × 1600 px | 3:2 or 16:9 | Showcase Banner & Gallery |
| **Bryant Park Winter Village** | 2400 × 1600 px | 3:2 or 16:9 | Package 6 (Family Package) |

*Note: All images must be real, licensed photographs (strictly no AI illustrations or stock vectors).*

---

### C. QA & Test Checklist

#### 1. 3D Times Square Hero
- [x] **Interaction:** Drag to look 360° in all directions smoothly.
- [x] **Zoom:** Mouse wheel and pinch gestures adjust FOV between 38° and 92°.
- [x] **Auto-Rotate:** Rotates gently when idle; pauses immediately upon user interaction.
- [x] **Hotspots:** Golden pulsating beacons project correctly onto the 3D sphere. Clicking a beacon opens an interactive tooltip card.
- [x] **Book Now from Hotspot:** Clicking "Book Now" inside a hotspot card jumps smoothly to the booking section with that package preselected.
- [x] **Controls:** Fullscreen toggle, Zoom In/Out, Reset View, and Hotspot visibility toggles all respond.
- [x] **Graceful Fallback:** Toggling "Parallax Fallback" or loading on a device without WebGL cleanly renders the multi-layer 2.5D parallax photo layer.

#### 2. Interactive Booking Flow
- [x] **Step 1 (Package):** Category filters (All, Iconic Landmarks, Festive Broadway, etc.) update list instantly. Selected package is highlighted.
- [x] **Step 2 (Dates):** Calendar blocks past dates. Changing arrival date automatically recalculates departure date based on package nights.
- [x] **Step 3 (Travelers):** Steppers update adults, children, and infants. Children receive 25% discount. Live price sidebar updates instantly.
- [x] **Step 4 (Add-ons):** Checking/unchecking luxury hotel upgrade, Broadway orchestra seats, and transfers updates total immediately.
- [x] **Step 5 (Traveler Details):** Inline validation enforces name (min 3 chars), valid email regex, and phone format. Shows red inline errors if invalid.
- [x] **Step 6 (Review & Confirm):** Shows full summary. Promo code `NYC2026` applies 15% discount; `HOLIDAY25` applies $100 discount. Demo payment banner is clearly labeled.
- [x] **LocalStorage Persistence:** Refreshing the browser preserves draft state (package, dates, travelers, add-ons). "Reset Draft" clears draft cleanly.

#### 3. Downloadable Ticket & Post-Booking Actions
- [x] **Reference ID:** Confirmation generates unique alphanumeric reference ID (e.g. `NYC-2026-X8F29Q`).
- [x] **Celebration:** Confetti effect triggers on completion.
- [x] **Download PDF Ticket:** Clicking "Download PDF Ticket" compiles a custom A4 document via jsPDF with deep navy header, gold accents, booking ID, itemized costs, and real QR code.
- [x] **Add to Calendar (.ics):** Generates and downloads an RFC-5545 iCalendar event with arrival and departure dates.
- [x] **Print Voucher:** Formatted clean layout via `@media print`.
- [x] **My Bookings Page:** Newly confirmed bookings are saved and listed with options to re-download or cancel.

#### 4. Navigation & Responsiveness
- [x] **Sticky Navbar:** Translucent glass effect on scroll with active section indicator.
- [x] **Mobile Menu:** Hamburger menu opens drawer, traps keyboard focus, closes on Escape or link selection.
- [x] **Falling Snow:** Canvas snowflakes animate smoothly; respect `prefers-reduced-motion` and can be toggled on/off.
- [x] **Zero Dead Links:** All internal links smoothly scroll to valid anchors or views.
