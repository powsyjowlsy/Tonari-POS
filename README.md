# TONARI - Point of Sale (POS) and Kitchen Management System

Version 1.1.0

A multi-device, offline-first Point of Sale (POS) and Kitchen Display System built for **Tonari**, an authentic Japanese food stall located in Tibanga, Iligan City.

Developed as part of the **ISY108 Requirements Engineering** course at Mindanao State University - Iligan Institute of Technology (MSU-IIT), College of Computer Studies, Department of Information Technology.

---

## Academic Team and Course Information

- **John Laurence T. Denore**
- **Jed Clark V. Razo**
- **Julz Brian L. Torralba**

- **Course:** ISY108 Requirements Engineering
- **Class Section:** IT3N.1
- **Course Instructor:** Prof. Mary Ann Gliefen B. Andrade
- **Academic Term:** First Semester, Academic Year 2026-2027
- **Institution:** Mindanao State University - Iligan Institute of Technology (MSU-IIT)

---

## Operational Background and Problem Statement

Based on stakeholder interviews and workflow audits conducted at the Tonari food stall in Tibanga, the stall previously operated using entirely manual methods: handwritten paper order slips, manual pocket-calculator arithmetic, unmonitored raw ingredient storage, and end-of-day spreadsheet reconciliation.

These manual processes resulted in three operational bottlenecks:
1. Handwritten order slips created transcription errors between counter cashiers and kitchen cooks during rush hours.
2. Cashiers had no real-time visibility into kitchen inventory, leading to customer orders being accepted for dishes whose key ingredients were already depleted.
3. End-of-day sales auditing, cash float balancing, and food waste calculations required over an hour of manual calculations after stall closing.

This system resolves these bottlenecks by providing an integrated, local-first software terminal that synchronizes order intake, kitchen ticket queues, raw ingredient portion tracking, and daily financial reporting.

---

## Core System Modules

### 1. Cashier POS Order Entry (View 1)
- **Menu Catalog:** Categorized item grid displaying Tonari's official menu items across six categories:
  - **Katsu Curry:** Chicken Katsu Curry, Pork Katsu Curry, Katsu Curry Ala Carte
  - **Takoyaki:** Classic Octopus Takoyaki (4 pcs / 8 pcs), Cheesy Overload Takoyaki
  - **Ramen:** Tonkotsu Rich Broth Ramen, Spicy Miso Ramen
  - **Gyoza:** Pan-Fried Pork Gyoza (4 pcs / 6 pcs)
  - **Ninja Wings:** Ninja Wings Rice Meal (3 pcs), Ninja Wings Ala Carte (6 pcs)
  - **Fruit Soda:** Green Apple Soda, Strawberry Lychee Soda, Blue Lemonade Fizz
- **Product Customization Modal:** Flavor selections, sauce adjustments, and piece count variations.
- **Real-Time Limiting Bottleneck Stock Badges:** Every product card calculates and displays the exact number of portions that can currently be prepared based on physical raw ingredient inventories, with status badges (`In Stock`, `Low Stock`, `Sold Out`).
- **Order Type Toggle:** Segmented pill controls for `Dine-In` and `Take-Out` orders.
- **Discount Calculation Engine:** Automated computation for Student discounts (5%) and Senior Citizen / PWD statutory discounts (20%).
- **Accidental Data-Loss Prevention:** Two-step confirmation safeguard on the cart clear button (`Confirm Clear?` with a 3.5-second safety timeout) preventing accidental order cancellation when items are in the cart.

### 2. Payment Tender and Cash Register
- **Cash Tender Engine:** Quick denomination buttons (`Exact`, `PHP 50`, `PHP 100`, `PHP 200`, `PHP 500`, `PHP 1,000`), touch numeric keypad, physical keyboard input support (`Enter`, `Backspace`, `Escape`), and change calculation with validation gating.
- **GCash Digital Payment Workflow:** Dedicated 13-digit GCash reference number validation and logging for electronic payment audit trails.

### 3. Thermal Receipt Generation
- **58mm Monospace Layout:** Standardized 32-column receipt layout displaying stall branding, transaction number, order type, date and time metadata, itemized product breakdowns, tax and discount subtotals, tender amounts, change, and cashier identifiers.
- **Physical Sawtooth Edge:** Visual rendering includes an authentic mechanical tear-off edge with drop shadow.
- **Printing Support:** Compatible with 58mm ESC/POS thermal printers via Windows print spoolers and standard browser print dialogs.

### 4. Kitchen Display System (KDS, View 2)
- **Live Ticket Rail:** Real-time preparation queue displaying incoming customer orders chronologically.
- **Elapsed Time Conversion:** Ticket timers decompose preparation duration into seconds, minutes, hours, and days (`5m 12s`, `1h 24m`, `2d 4h`).
- **SLA Urgency Escalation:** Visual ticket warnings escalate based on elapsed duration (warning state at 5 minutes, critical state at 10 minutes).
- **Order Progression:** One-click status transitions across order lifecycles: `Pending` -> `Preparing` -> `Ready for Pickup` -> `Completed`.

### 5. Inventory and Recipe Bill of Materials (View 3)
- **Three-Tab Management Interface:**
  - **Finished Products:** Menu items, current prices, threshold limits, and available yield calculations.
  - **Raw Ingredients and Packaging:** Raw material tracking across seven categories (Proteins, Starches, Broths, Sauces, Garnishes, Beverages, Packaging).
  - **Kitchen Spoilage / Waste Tracker:** Logging of dropped, burnt, or expired ingredients and finished dishes, with automatic net financial loss computation.
- **Dual-Mode Stock Reconciliation:**
  - **Delta Adjustment (`Adjust (+/-)`):** Increment or decrement stock using unit-aware quick presets (`g`, `ml`, or discrete units).
  - **Absolute Stock Level (`Set (=)`):** Direct reconciliation to physical shelf counts, featuring a live three-column variance equation (`Current Stock` -> `Net Variance` -> `New Stock`).
- **Recipe Bill of Materials (BOM) Authoring:** Author and update multi-ingredient recipe decomposition tables connecting finished dishes to raw ingredient inventories.

### 6. Sales Analytics and Daily Z-Reading (View 4)
- **Key Performance Indicators:** Daily Gross Sales, Total Orders Count, Average Order Value (AOV), and Cash versus GCash payment distribution.
- **Cash Float Reconciliation:** Input and verify starting drawer cash float against calculated in-drawer cash totals.
- **Product Velocity Rankings:** Top-selling dishes ranked by unit volume and total revenue contribution.
- **Historical Sales Ledger:** Searchable transaction history with manager PIN authorization for order voids.
- **Export to CSV:** One-click data export saving full sales ledgers to `Desktop/Tonari_Sales_Reports/`.

### 7. Executive Performance Dashboard (View 5)
- Store performance overview displaying daily revenue velocity, hourly order distributions, active kitchen ticket workload, and critical stock bottleneck notifications.

### 8. Dedicated Administrator and Access Control (View 6)
- **Staff Accounts Administration:** Full management of staff user profiles (create, edit, reset PINs, delete with master administrator protection).
- **Role-Based Privilege Matrix:** Visual permission grid enforcing operational boundaries across `Admin`, `Cashier`, and `Kitchen` roles.
- **Dynamic Category Workspace:** Create, edit, and organize menu product categories and raw inventory supply categories with real-time interface synchronization.
- **Staff Session Switcher:** Quick PIN-authenticated user switching accessible from the sidebar.

### 9. Terminal and Network Diagnostics
- **Primary Server Address:** Host IP address and listening port specifications for local network operations.
- **Handheld and Mobile Companion Access:** Pairing configuration allowing smartphones and wireless tablets connected to the local Wi-Fi network to access the interface at `http://<LAN_IP>:3000`.
- **Hardware Status:** Terminal station identity, receipt printer emulation readiness, barcode scanner keyboard wedge status, RJ11 cash drawer trigger, and storage health metrics.

---

## Universal Multi-Device Architecture

The application includes responsive layout configurations optimized for different hardware form factors:
- **Desktop Mode (>= 1200px):** Two-column layout (65% menu catalog, 35% fixed cart) with persistent executive sidebar navigation.
- **Tablet Countertop Mode (768px - 1199px):** Two-column touch layout calibrated for 1024x768 and 1280x800 commercial point-of-sale touchscreens.
- **Mobile Smartphone Mode (< 768px):** Single-column layout with horizontal scrollable category rail, two-column compact product card grid, persistent checkout peek bar, slide-up cart drawer, and bottom navigation.
- **Viewport Switcher:** Header control (`Auto`, `Desktop`, `Tablet`, `Mobile`) allowing immediate viewport simulation on any display during system demonstrations.

---

## User Interface and Design Standards

- **Dynamic Typography:** Standardized on `Plus Jakarta Sans` for interface headings, labels, navigation items, and buttons, paired with `JetBrains Mono` for tabular numerals, currency values, stock counts, receipt print lines, and network parameters.
- **Tabular Figures:** All numeric values, prices, timestamps, and receipt rows enforce `font-variant-numeric: tabular-nums` to prevent horizontal jitter during live updates.
- **Minimalist Segmented Controls:** Modern enclosed pill containers with subtle borders and elevated active state indicators.
- **Ergonomic Safety Safeguards:** Destructive actions such as clearing the order cart require a two-step confirmation state with an automatic safety timeout.
- **Accessible Modal Controls:** Every modal dialog includes a standardized dismiss button with high-contrast hover feedback and keyboard `Escape` dismiss support.

---

## Technology Stack

- **Desktop Shell:** Electron v33.4.11
- **Local Network Server:** Node.js (native `http`, `fs`, `os`, and `path` modules)
- **Frontend Engine:** Vanilla HTML5, CSS3, ES6 JavaScript (zero external UI framework dependencies)
- **Data Persistence:** Reactive local state store with encrypted JSON stores in `localStorage`, paired with automated filesystem CSV exports
- **Packaging and Distribution:** `electron-builder` producing single-file portable Windows executables

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended; developed on Node.js v24)
- npm (Node Package Manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/powsyjowlsy/Tonari-POS.git
cd Tonari-POS

# Install development dependencies
npm install
```

### Running the Application

#### Option 1: Standalone Desktop Window
```bash
npm start
```
On Windows systems, you may also double-click `run.bat` in the repository root.

#### Option 2: Local Network Server for Mobile Smartphones and Tablets
```bash
npm run server
# or: node server.js
```
Connect your smartphone or tablet to the same local Wi-Fi network and open the displayed IP address in any standard browser (for example, `http://192.168.1.15:3000`).

#### Option 3: Compile Standalone Portable Windows Executable (.exe)
```bash
npm run dist
```
The compiled single-file portable executable is generated in `dist/Tonari POS 1.1.0.exe` (~72.7 MB).

---

## Verification and Quality Assurance

The codebase includes an automated regression test suite covering core operations:
```bash
# Run master POS operations test suite
python scripts/verify_pos_system.py

# Run UI/UX and feedback verification suite
python scripts/verify_feedback_fixes.py

# Run adversarial stress-testing challenge suite
python scripts/adversarial_challenge_m1.py
```

---

## License and Academic Usage

This project was developed for academic evaluation in the ISY108 Requirements Engineering course at Mindanao State University - Iligan Institute of Technology (MSU-IIT) and for operational deployment at Tonari. All rights reserved.
