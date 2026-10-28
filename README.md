# TONARI - Point of Sale (POS) System

A multi-device, offline-first Point of Sale (POS) software built for **Tonari**, an authentic Japanese-inspired food stall located in Tibanga, Iligan City.

Developed as part of the **ISY108 Requirements Engineering** course at Mindanao State University - Iligan Institute of Technology (MSU-IIT), Department of Information Technology.

---

## Team Members & Contributors

- **John Laurence T. Denore**
- **Jed Clark V. Razo**
- **Julz Brian L. Torralba**

**Course Instructor:** Prof. Mary Ann Gliefen B. Andrade  
**Class Section:** IT3N.1

---

## Project Overview & Background

Based on stakeholder interviews, Tonari previously relied on manual paper order tickets, manual pocket-calculator calculations, unmonitored inventory, and manual end-of-day Excel spreadsheet tallying.

This system provides an end-to-end operational software terminal that solves these root pain points:
1. **Paperless Order Intake**: Replaces handwritten paper order slips with an instant Tap-to-Order Cashier interface synchronized with a live Kitchen Display System (KDS).
2. **Automated Computation**: Calculates order line totals, itemized flavor modifiers, student/senior discounts, totals, and cash change with exact centavo precision.
3. **Physical Recipe Bill of Materials (BOM) & Inventory Tracking**: Menu item stock availability is computed in real-time from limiting physical raw ingredient inventories (BOM bottleneck engine). Stock automatically decrements upon checkout, with automatic sold-out badging and low-stock warning banners.
4. **Kitchen Waste & Spoilage Auditing**: Two-way spoilage logger tracking discarded menu dishes and raw kitchen supplies with automatic financial loss calculation.
5. **Role-Based Access Control (RBAC)**: Secure multi-account environment segregating permissions across Administrator, Cashier, and Kitchen roles with PIN authentication.
6. **Automated Sales & Z-Reading**: Calculates daily gross sales, transaction counts, average order value (AOV), and payment splits (Cash vs. GCash), with one-click **Export to CSV** action writing sales ledgers directly to `Desktop/Tonari_Sales_Reports/`.

---

## Core System Modules

### 1. Cashier POS Order Entry (View 1)
- Tap-to-Order catalog featuring Tonari's official items:
  - **Katsu Curry**: Chicken Katsu Curry, Pork Katsu Curry, Katsu Curry Ala Carte
  - **Takoyaki**: Classic Octopus Takoyaki (4 pcs / 8 pcs), Cheesy Overload Takoyaki
  - **Ramen**: Tonkotsu Rich Broth Ramen, Spicy Miso Ramen
  - **Gyoza**: Pan-Fried Pork Gyoza (4 pcs / 6 pcs)
  - **Ninja Wings**: Ninja Wings Rice Meal (3 pcs), Ninja Wings Ala Carte (6 pcs)
  - **Fruit Soda**: Green Apple Soda, Strawberry Lychee Soda, Blue Lemonade Fizz
- Item flavor and modifier customization dialog (sauce variations, piece counts).
- Limiting bottleneck portions counter and real-time stock pills (`In Stock`, `Low Stock`, `Sold Out`).
- Order type switching: `Dine-In` vs. `Take-Out` with Apple/Stripe-style segmented pill controls.
- Student Discount (5%) and Senior / PWD Discount (20%) calculation engine.

### 2. Payment Tender & Change Engine
- **Cash Workflow**: Quick denomination buttons (`Exact`, `PHP 50`, `PHP 100`, `PHP 200`, `PHP 500`, `PHP 1,000`), touch numeric keypad, physical keyboard shortcut support (Enter, Backspace, Escape), and change calculation with validation gating.
- **GCash Workflow**: Dedicated 13-digit GCash Reference Number logging for digital payment audit trails.

### 3. 58mm Thermal Monospace Receipt Generator
- Formatted 32-column ASCII thermal receipt roll layout with stall branding, order metadata, itemized table, discount breakdowns, and print preview.
- Supports native silent printing via Windows print spoolers and browser print fallbacks.

### 4. Kitchen Display System (KDS) (View 2)
- Live kitchen order ticket rail tracking elapsed preparation times.
- Real-time SLA urgency timer badges decomposing elapsed time into seconds, minutes, hours, and days (`5m 12s`, `1h 24m`, `2d 4h`) with color-coded escalation (`sla-warning` at 5m, `sla-critical` at 10m).
- Lifecycle stage progression: `Pending` -> `Preparing` -> `Ready for Pickup / Serving` -> `Completed`.

### 5. Inventory & Supply Chain Subsystem (View 3)
- **3-Tab Segmented Interface**:
  - **Finished Products**: Menu dish catalog, limiting bottleneck yields, base prices, and threshold alerts.
  - **Raw Ingredients & Packaging**: Comprehensive catalog across 7 categories (Proteins, Starches, Broths, Sauces, Garnishes, Beverages, Packaging).
  - **Kitchen Spoilage / Waste Tracker**: Real-time logging of dropped, burnt, or expired supplies with unit cost tracking and net financial loss calculation.
- **Dual-Mode Stock Reconciliation**:
  - Relative adjustment (`Adjust (+/-)`): Delta increments with unit-aware preset chips (`-1000` to `+1000` for `g`/`ml` or `-50` to `+50` for discrete units).
  - Absolute count (`Set (=)`): Direct reconciliation to physical counted inventory with live 3-column net variance preview (`Current Stock` -> `Net Variance` -> `New Stock`).
- **Recipe BOM Authoring**: Dialog enabling multi-ingredient recipe decomposition mapping for new dishes.

### 6. Sales Analytics & Daily Z-Reading (View 4)
- Executive KPI metric cards: Gross Sales Today, Transactions Count, Average Order Value (AOV), and Payment Method Breakdown.
- Cash float drawer reconciliation tracking starting cash float against expected in-drawer cash.
- Top-selling item ranking by units sold and generated revenue.
- Comprehensive searchable historical transaction ledger with secure void flow.
- One-click **Export Sales to CSV** function saving directly to `Desktop/Tonari_Sales_Reports/`.

### 7. Executive Performance Dashboard (View 5)
- Store performance overview featuring gross revenue trends, hourly transaction velocity, active kitchen ticket load, and critical inventory bottleneck callouts.

### 8. Dedicated Admin & Access Control (View 6)
- **Staff Accounts Administration**: Full CRUD management for staff profiles (create, edit, reset PINs, delete with master admin protection).
- **Role-Based Privilege Matrix**: Visual permission grid enforcing operational boundaries across `Admin`, `Cashier`, and `Kitchen` roles.
- **Dynamic Catalog Category Workspace**: Create, edit, and organize menu dishes and raw inventory supply categories with instantaneous UI synchronization.
- **Staff Session Switcher**: Fast PIN-authenticated user switching from the executive sidebar with centered role indicators.

---

## Universal Multi-Device Architecture

The software operates across three responsive viewport configurations:
- **Desktop Mode (>= 1200px)**: 2-column layout (65% Catalog / 35% Fixed Cart) with executive sidebar navigation.
- **Tablet Countertop Mode (768px - 1199px)**: Landscape 2-column touch interface optimized for 1024x768 and 1280x800 point-of-sale displays.
- **Mobile Smartphone Mode (< 768px)**: 1-column mobile-first layout featuring a horizontal scrollable category rail, 2-column compact product card grid, persistent sticky bottom checkout peek bar, slide-up cart drawer sheet, and bottom navigation bar.
- **Interactive Viewport Switcher**: Built-in header switcher (`Auto`, `Desktop`, `Tablet`, `Mobile`) allowing immediate device simulation on any display during presentations.

---

## Design System & Anti-AI Human-Centric Standards

- **Utilitarian & Hardware Typography**: Disciplined pairing of `IBM Plex Sans` (UI / display) with `IBM Plex Mono` (data, telemetry, thermal receipt rolls) declared at `:root`. Large headings enforce subtle negative tracking (`-0.025em`) and dark surfaces apply balanced optical leading.
- **Legibility Floor**: Functional UI text enforces an 11px to 12px floor across badges, status pills, and data tags.
- **Strict Tabular Numerals**: Enforced via `font-variant-numeric: tabular-nums` across all currency values, quantities, timestamps, and receipt rows.
- **Modern Minimalist Segmented Controls**: Enclosed pill containers (`var(--bg-subtle)`, muted border, rounded radius) with elevated floating active cards (`box-shadow: 0 1px 3px rgba(0,0,0,0.08)`) and active press scaling (`transform: scale(0.92)`).
- **Subtle Destructive Triggers**: Line item removal, cart clearing, and order voids use ghost triggers with progressive red hover feedback.
- **Universal Modal Header Controls**: 100% of modals feature standard accessible `.modal-close-btn` (`&times;`) triggers with high-contrast hover feedback.
- **Strict Zero-Emoji Invariant**: Zero emojis across UI components, markdown headers, console telemetry, thermal receipts, and commit logs.

---

## Technology Stack

- **Desktop Shell**: Electron v33.4.11
- **Local Network Server**: Node.js v24.14.1 (Native `http`, `fs`, `os`, `path` modules)
- **Frontend Architecture**: Vanilla HTML5, CSS3 (Modular Flat Design System), ES6 JavaScript
- **Local Persistence**: Client-side reactive `localStorage` state store + atomic file system report logging
- **CodeGraph Intelligence**: `@colbymchenry/codegraph` AST symbol intelligence engine
- **Packaging**: Electron Builder (Portable Windows `.exe` and unpacked runtime)

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended; developed on v24.14.1)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/powsyjowlsy/Tonari-POS.git
cd Tonari-POS

# Install development dependencies
npm install
```

### Running the Application

#### Option 1: Standalone Desktop Software Window
```bash
npm start
```
Or double-click `run.bat` on Windows.

#### Option 2: Run Local Network Server for Mobile Smartphones
```bash
npm run server
# or: node server.js
```
Then connect your mobile phone or tablet to the same local Wi-Fi network and open the displayed URL (e.g., `http://192.168.1.XX:3000`).

#### Option 3: Compile Standalone Portable Windows Executable (.exe)
```bash
npm run dist
```
The compiled single-file portable executable is output to `dist/Tonari POS 1.1.0.exe`.

---

## License

This project was developed for educational and operational purposes for Tonari under the ISY108 course curriculum at MSU-IIT. All rights reserved.
