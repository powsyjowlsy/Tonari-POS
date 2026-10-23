# TONARI - Point of Sale (POS) System

A multi-device, offline-first Point of Sale (POS) software built for **Tonari**, an authentic Japanese-inspired food stall located in Tibanga, Iligan City.

Developed as part of the **ISY108 Requirements Engineering** course at Mindanao State University - Iligan Institute of Technology (MSU-IIT), Department of Information Technology.

---

## Team Members & Contributors

- **John Laurence T. Denore**
- **Jed Clark V. Razo**
- **Julz Brian L. Torralba**

**Course Instructor:** Prof. Mary Ann Gliefen B. Andrade

---

## Project Overview & Background

Based on stakeholder interviews, Tonari previously relied on manual paper order tickets, manual pocket-calculator calculations, unmonitored inventory, and manual end-of-day Excel spreadsheet tallying.

This system provides an end-to-end operational software terminal that solves these root pain points:
1. **Paperless Workflow**: Replaces paper slips with an instant Tap-to-Order Cashier interface synchronized with a live Kitchen Display System (KDS).
2. **Automated Computation**: Calculates order line totals, student/senior discounts, totals, and cash change with exact centavo precision.
3. **Automated Inventory Tracking**: Menu items automatically decrement physical stock upon checkout and trigger amber low-stock threshold warning banners.
4. **Automated Sales & Z-Reading**: Calculates daily gross sales, transaction counts, average ticket size, and payment splits (Cash vs. GCash), with a one-click **Export to CSV** action that writes Excel-ready sales reports directly to the Desktop.

---

## Core System Modules

### 1. Cashier POS Order Entry
- Tap-to-Order menu catalog featuring Tonari's official items:
  - **Katsu Curry**: Chicken Katsu Curry, Pork Katsu Curry, Katsu Curry Ala Carte
  - **Takoyaki**: Classic Octopus Takoyaki (4 pcs / 8 pcs), Cheesy Overload Takoyaki
  - **Ramen**: Tonkotsu Rich Broth Ramen, Spicy Miso Ramen
  - **Gyoza**: Pan-Fried Pork Gyoza (4 pcs / 6 pcs)
  - **Ninja Wings**: Ninja Wings Rice Meal (3 pcs), Ninja Wings Ala Carte (6 pcs)
  - **Fruit Soda**: Green Apple Soda, Strawberry Lychee Soda, Blue Lemonade Fizz
- Real-time stock status pills (`In Stock`, `Low Stock`, `Out of Stock`).
- Dine-In vs. Take-Out order toggling.
- Student Discount (5%) and Senior / PWD Discount (20%) engine.

### 2. Payment Tender & Change Engine
- **Cash Workflow**: Quick denomination buttons (`Exact`, `PHP 50`, `PHP 100`, `PHP 200`, `PHP 500`, `PHP 1,000`), touch numeric keypad, and automatic real-time change calculation with validation gating.
- **GCash Workflow**: Dedicated 13-digit GCash Reference Number logging for digital payment audit trails.

### 3. 58mm Thermal Monospace Receipt Generator
- Formatted 32-column ASCII thermal receipt roll layout with store branding, order metadata, itemized table, totals, and print preview.
- Supports native silent printing via Windows print spoolers and browser print fallbacks.

### 4. Kitchen Display System (KDS)
- Live kitchen order ticket rail tracking elapsed preparation times.
- Lifecycle stage progression: `Pending` -> `Preparing` -> `Ready for Pickup / Serving` -> `Completed`.

### 5. Inventory Management
- Tabular stock management with minimum alert threshold indicators.
- One-tap quick restocking (`+10`, `+25`, `+50`) and item detail editing.
- Automatic stock restoration upon transaction voiding.

### 6. Sales Analytics & Daily Z-Reading
- KPI metric cards: Gross Sales Today, Transactions Count, Average Order Value (AOV), and Payment Method Breakdown.
- Top-selling item ranking by units sold and generated revenue.
- Comprehensive searchable historical transaction ledger.
- One-click **Export Sales to CSV** function saving directly to `Desktop/Tonari_Sales_Reports/`.

---

## Universal Multi-Device Architecture

The software operates across three viewport configurations:
- **Desktop Mode (>= 1200px)**: 2-column layout (65% Catalog / 35% Fixed Cart) with top navigation bar.
- **Tablet Countertop Mode (768px - 1199px)**: Landscape 2-column touch interface optimized for 1024x768 and 1280x800 displays.
- **Mobile Smartphone Mode (< 768px)**: 1-column mobile-first layout featuring a horizontal scrollable category rail, 2-column compact product card grid, persistent sticky bottom checkout peek bar, slide-up cart drawer sheet, and bottom navigation bar.
- **Interactive Viewport Switcher**: Built-in header switcher (`Auto`, `Desktop`, `Tablet`, `Mobile`) allowing immediate device simulation on any display during presentations.

---

## Design System Invariants

- **Zero Gradients**: Exclusively solid, flat color tokens (`#1E232A` slate dark header, `#FFFFFF` card surfaces, `#B91C1C` Tonari brand crimson, `#15803D` success green, `#B45309` warning amber).
- **Zero Emojis**: All UI components use clean typography, CSS shapes, or SVG vector stroke icons.
- **Tabular Numerals**: Enforced via `font-variant-numeric: tabular-nums` across all prices, quantities, and receipt rows to ensure exact vertical decimal alignment.

---

## Technology Stack

- **Desktop Shell**: Electron v33.4.11
- **Local Network Server**: Node.js v24.14.1 (Native `http`, `fs`, `os`, `path` modules)
- **Frontend**: Vanilla HTML5, CSS3 (Modular Flat Design System), ES6 JavaScript
- **Local Persistence**: Client-side `localStorage` state store + atomic file system report logging
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
node server.js
```
Then connect your smartphone to the same Wi-Fi network and open the URL displayed in the console (e.g., `http://192.168.1.XX:3000`).

#### Option 3: Compile Standalone Portable Windows Executable (.exe)
```bash
npm run dist
```
The compiled single-file portable executable will be generated in `dist/Tonari POS 1.0.0.exe`.

---

## License

This project was developed for educational and operational purposes for Tonari under the ISY108 course curriculum. All rights reserved.
