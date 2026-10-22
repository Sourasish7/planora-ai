# 🌟 Planora AI — GenAI-Powered Event Planning Assistant

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Official Problem Statement:**
> *"Create a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas."*

---

## 📖 About Planora AI

**Planora AI** is a modern, full-stack event planning web platform built with a high-energy **Neobrutalism Retro-Pop aesthetic**. It empowers hosts, coordinators, and celebration organizers to plan complex events in minutes through autonomous AI generation and structured management tools.

Whether organizing a high-end luxury wedding, an electrifying milestone birthday, a multi-stage college festival, or a sustainable community fair, Planora AI breaks down every requirement into actionable budgets, hour-by-hour operational runs of show, vendor contracts, guest seating, and visual decoration guides.

---

## ✨ Key Features & Capabilities

### 1. 🧠 Autonomous Event Blueprint Generator & AI Co-Pilot
- **Instant Event Generation**: Generates comprehensive end-to-end event blueprints across 7 celebration archetypes in under 2 seconds.
- **Context-Aware AI Co-Pilot**: Multi-turn conversational planning assistant with full event memory. Ask questions regarding budget trimming, icebreaker games, toast speech copy, or day-of emergency kits.
- **Hybrid AI Architecture**: Operates with an internal autonomous rule engine offline, with seamless optional integration for live **Google Gemini** or **OpenAI** LLM models.

### 2. 💰 Dynamic Budget Allocation & Expense Management
- **Calibrated Budget Distribution**: Automatic category-by-category allocation (Venue, Catering, AV & Lighting, Floral & Styling, Live Music, Photo/Video, Contingency Reserve).
- **Itemized Ledger**: Track payments with statuses (*Paid* vs *Pending*), dates, payment methods, and linked vendors.
- **Budget Health Visualizer**: Live variance calculations, utilization percentages, and over-budget warnings.

### 3. 🖼️ Visual Required Decoration Items & Photo Guide
- **Curated Visual Catalog**: Photo showcase cards with verified high-resolution imagery displaying exactly what each decoration, lighting fixture, centerpiece, and installation looks like.
- **Procurement Tracking**: Mark decoration supplies as procured or delete items with real-time progress counters.
- **Custom Supply Addition**: Quickly add new required decoration items tailored to your theme.

### 4. 🖨️ Official Expense & Budget Printable Reports
- **1-Click Print & PDF Generation**: Generates clean, printer-friendly expense summaries with key metrics, allocation variances, and itemized receipts.
- **Zero-Blank-Page Guarantee**: Streamlined print stylesheet configured for both dialog printing and standard browser `Ctrl + P`.

### 5. ⏱️ Timeline & Master Day-of Run of Show
- **Chronological Milestones**: Month-by-month and week-by-week planning checklist with due dates and completion toggles.
- **Hour-by-Hour Schedule**: Detailed operational schedule (start time, end time, location, person-in-charge, and status tracking) formatted for MCs and coordinators.

### 6. 📋 Vendor Pipeline & Contract Directory
- **Lifecycle Tracking**: Track vendor leads through `Researching` ➔ `Contacted` ➔ `Quote Received` ➔ `Shortlisted` ➔ `Booked` ➔ `Completed`.
- **Contract & Deposit Management**: Quick-toggle checkboxes for signed agreements and paid down-payments.

### 7. 👥 Guest List & RSVP Headcount
- **Real-Time Headcount**: Attending, declined, and pending RSVP tracking with plus-one counts.
- **Dietary Tracking**: Categorized dietary preferences (Vegetarian, Vegan, Gluten-Free, Halal, Kosher, Nut Allergies).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | TailwindCSS + Neobrutalism Design System |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database** | Local JSON Database with Atomic File Swaps (`src/lib/db.ts`) |
| **Validation** | [Zod](https://zod.dev/) Schema Validation |
| **AI Integration** | Planora Autonomous Heuristic Engine + Google Gemini + OpenAI |
| **Testing** | Node.js Test Runner (`node --test`) |

---

## 💻 How to Install & Run on Your Local Server

Follow these simple steps to clone, configure, and run Planora AI on your local machine or server.

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (tested on Node.js v20 and v24)
- **npm** (comes with Node.js) or **pnpm** / **yarn**
- **Git**

Verify your environment by running:
```bash
node -v
npm -v
git -v
```

---

### Step 1: Clone the Repository

Clone the project repository to your local directory:
```bash
git clone https://github.com/Sourasish7/planora-ai.git
cd planora-ai
```

---

### Step 2: Install Dependencies

Install all required npm packages:
```bash
npm install
```

---

### Step 3: Configure Environment Variables (Optional)

Planora AI includes a built-in autonomous heuristic AI engine that works **100% offline out-of-the-box with no API keys required**.

If you wish to enable online Google Gemini or OpenAI LLM capabilities, create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your preferred API keys:
```env
# Optional: Live AI Provider Configuration
NEXT_PUBLIC_AI_PROVIDER=gemini # or "openai" or "heuristic"
GEMINI_API_KEY=your_google_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

---

### Step 4: Run the Development Server

Start the local development server:
```bash
npm run dev
```

Once started, open your browser and navigate to:
```
http://localhost:3000
```

---

### Step 5: Run Automated Tests

Run the complete test suite to verify code integrity and security:
```bash
npm test
```
*Executes all 9 unit test suites covering input sanitization, rate limiting, Zod schema validation, database atomic writes, and the AI blueprint generator.*

---

### Step 6: Build for Production (Optional)

To build and run an optimized production bundle:
```bash
npm run build
npm start
```

---

## 📁 Project Directory Structure

```
planora-ai/
├── data/
│   └── planora-db.json          # Local atomic JSON database
├── public/                      # Static assets and icons
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts    # AI Co-Pilot chat API endpoint
│   │   │   ├── events/route.ts  # CRUD events API endpoint
│   │   │   └── generate/        # AI blueprint generator endpoint
│   │   ├── globals.css          # Neobrutalism design system tokens & print styles
│   │   ├── layout.tsx           # Root HTML structure and typography
│   │   └── page.tsx             # Main interactive application dashboard
│   ├── components/
│   │   ├── EventHeader.tsx      # Celebration hero card & action triggers
│   │   ├── ExpenseReportModal.tsx # Expense report interactive modal
│   │   ├── Navbar.tsx           # Neobrutalism top navigation bar
│   │   ├── NewEventModal.tsx    # Event creation and AI generation modal
│   │   ├── PrintableExpenseReport.tsx # Dedicated printer-friendly report
│   │   ├── SettingsModal.tsx    # AI provider configuration modal
│   │   ├── TabNavigation.tsx    # Tab navigation bar
│   │   └── tabs/
│   │       ├── AICopilotTab.tsx # AI Chat assistant tab
│   │       ├── BudgetTab.tsx    # Budget allocation & expense tracker
│   │       ├── IdeasTab.tsx     # Themes, menus, activities & invitations
│   │       ├── OverviewTab.tsx  # KPI metrics & visual decoration catalog
│   │       ├── TimelineTab.tsx  # Milestones & master run of show
│   │       └── VendorsTab.tsx   # Vendor pipeline & contract tracker
│   ├── lib/
│   │   ├── ai-engine.ts         # Autonomous GenAI engine & prompt handlers
│   │   ├── db.ts                # Atomic JSON database manager
│   │   ├── mockData.ts          # Default event templates
│   │   ├── security.ts          # XSS sanitization & token-bucket rate limiting
│   │   └── utils.ts             # Currency formatting & helpers
│   ├── tests/
│   │   └── ai-engine.test.ts    # Comprehensive automated test suites
│   └── types/
│       └── index.ts             # TypeScript interface definitions
├── .gitignore                   # Git exclusion rules
├── next.config.mjs              # Hardened HTTP security headers
├── package.json                 # Project dependencies & scripts
├── README.md                    # Project documentation
└── tsconfig.json                # TypeScript compiler configuration
```

---

## 🛡️ Security & Resilience Highlights

- **Atomic File Swapping**: Database writes in `src/lib/db.ts` write to `.json.tmp` and execute an atomic file rename to prevent file corruption during system shutdowns or interruptions.
- **XSS Defense & Input Sanitization**: All incoming inputs are scrubbed with recursive regex sanitizers that remove HTML and `<script>` injections.
- **Zod Validation**: Strict type boundaries for all event attributes, preventing invalid data entry.
- **Token Bucket Rate Limiting**: Protects API routes against spamming and denial-of-service attempts.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use and adapt it for your event planning needs.

---

© 2026 **Planora AI** — Built by [Sourasish7](https://github.com/Sourasish7). Empowering memorable celebrations worldwide.
