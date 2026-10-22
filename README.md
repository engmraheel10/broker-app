# Capitas Finance — Broker & Asset Finance Platform (Frontend Prototype)

A high-quality, clickable, enterprise-grade React + TypeScript frontend prototype of a commercial Broker & Asset Finance Management Platform.

## 🚀 Quick Start (Single Run)

Start the entire application with one command:

```bash
./starter.sh
```

Or from inside `broker-app`:

```bash
cd broker-app
./starter.sh
```

Local URL: **http://localhost:5173/**

---

## 🛠 Tech Stack

- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS with custom enterprise palette
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State Management**: React Context (`AppContext`) with automatic `localStorage` persistence and cross-route synchronization

---

## 🧭 Routes & Modules

| Route | Page | Description |
|---|---|---|
| `/dashboard` | **Dashboard** | KPI metrics, quotation-to-proposal conversion funnel, recent quotations, recent proposals, and audit activity feed |
| `/quotations` | **Quotations Listing** | Filterable, searchable table with sorting, pagination, and row actions |
| `/quotations/new` | **Create Quotation** | Customer entity, dynamic multi-asset line items, amortization structure, live financial summary |
| `/quotations/:id` | **Quotation Details** | Complete asset schedule, VAT breakdown, amortization terms, printable format, convert modal |
| `/quotations/:id/edit` | **Edit Quotation** | Pre-populated quotation form for updating pricing and terms |
| `/proposals` | **Proposals Listing** | Filterable by status and lender, tracking underwriting workflow |
| `/proposals/new` | **Proposal Wizard** | 7-step wizard: Customer → Assets → Financials → Broker Selection → Supporting Docs → Summary Review → Lender Selection & Submission |
| `/proposals/:id` | **Proposal Details** | Functional tabs for Overview, Assets, Financials, Documents, and Activity/Audit trail |
| `/proposals/:id/edit` | **Edit Proposal** | Step-by-step update for proposal records |
| `/customers` & `/:id` | **Customer Directory** | Limited companies and sole traders, credit rating tags, active facilities |
| `/assets` | **Asset Register** | Machinery, commercial vehicles, CNC engineering, and agriculture asset catalog |
| `/brokers` & `/:id` | **Broker Network** | Authorized FCA intermediaries, packaging partners, commission tiers |
| `/dealers` & `/:id` | **Dealer Directory** | Machinery dealership network, branch tiers (Platinum, Gold, Silver), volume YTD |
| `/lenders` | **Lender Panel** | Investec Asset Finance, Lombard, Capitas Internal Credit, Aldermore, Close Brothers with live API test pings |
| `/users` | **Users & Access** | Multi-tenant role switcher (Tenant Admin, Broker Admin/User, Dealer Admin/User) |
| `/reports` | **Reports & Analytics** | Origination volume trends, approval SLA, funder share, simulated CSV export |
| `/audit` | **System Audit Log** | Immutable event trace with timestamps, users, actions, target entities, IP addresses |
| `/settings` | **Settings** | Organization legal profile, financial calculation defaults, API keys, notifications |

---

## 🌟 Key Features & User Journey

1. **End-to-End Quotation-to-Proposal Flow**:
   - Create a quotation with multiple assets, deposit, term, and interest rate.
   - Dynamic real-time calculation of VAT, finance requested, and repayments.
   - Save as draft or convert directly into a credit proposal.
   - Step through the 7-stage proposal wizard: review pre-filled data, select a broker, attach simulated documents, review summary, and dispatch to Investec or internal syndication.
2. **Multi-Tenant Role Simulator**:
   - Switch between **Tenant Admin**, **Broker Admin**, **Broker User**, **Dealer Admin**, and **Dealer User** in the top navigation profile dropdown or the Users page.
3. **Responsive Enterprise Financial UI**:
   - Persistent dark navy sidebar with active route highlights and unread count badges.
   - Global search modal (`Cmd+K`).
   - Notification drawer with link navigation.
   - Accessible modal dialogs and toasts for all actions.
