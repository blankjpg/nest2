# nest — Smart Weekly Budgeting & Micro-ISA for Starling Bank

A weekly saving web app designed for young (20s–30s) Starling Bank customers.

Users enter their monthly spare money, which sets a weekly allowance. Every card purchase automatically tucks 2% into a cash ISA pot. Finishing a week with £0 or more builds a streak, and any unspent leftover budget is swept into the ISA on Sunday night.

> **Note:** There is **NO** investing, stock picking, tickers, or portfolio volatility anywhere in this app. It is pure, automated cash saving.

---

## 🎯 The Rules (Implemented Exactly)

1. **Setup & Adjustments**: User sets monthly spare money. Can be updated at any time in Settings, and changes take effect starting **next week**.
2. **Weekly Budget**: `Weekly Budget = Monthly Spare Money / 4.3` (accounting for the average 4.3 weeks in a calendar month).
3. **Every Card Purchase**: 2% automatically transfers to the ISA. Both the purchase price and the 2% ISA deduction count against the weekly budget.  
   *(Example: A £50 dinner uses £51 of weekly budget and deposits £1 directly into the ISA).*
4. **Over Budget**: If spending exceeds the weekly budget, the 2% **still** transfers to the ISA, the budget shows a red negative number, and the streak breaks (resets to 0).
5. **End of Week (Sunday Close)**: Any money remaining in the budget is swept to the ISA. If the user finished at or above £0, the streak increases by 1. If below £0, no leftover is moved, the streak resets, and an encouraging summary is shown.

---

## 🛠 Tech Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS** (dark navy `#090d16` and Starling-inspired emerald green `#00d09c` palette)
- **React Router** for seamless multi-page flow
- **Recharts** for savings history visualizations
- **Vitest** for pure mathematical rule unit testing
- **Lucide React** for clean fintech iconography
- **Canvas Confetti** for week-close celebrations

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run unit tests
All pure mathematical logic in `src/lib/math.ts` is backed by unit tests verifying Rules 1 through 5:
```bash
npm run test
```

### 4. Build for production
```bash
npm run build
```

---

## 🔌 Where to Plug in the Real Starling API

The application architecture isolates all data operations inside **`src/api/`**. The front-end components and React Context never call storage or mock APIs directly; they consume methods from `src/api/index.ts`.

To connect live Starling Bank developer sandbox or production APIs, swap out the implementation in `src/api/index.ts`:

### 1. Card Transactions Feed
* **Current mock function**: `getTransactions()` in [src/api/index.ts](file:///c:/Users/anton/Documents/CLionProjects/nest2/src/api/index.ts)
* **Starling API Endpoint**:  
  `GET /api/v2/feed/account/{accountUid}/category/{categoryUid}/transactions-between`
* **Real-time Webhook**: Starling `TRANSACTION_CARD` webhook payload triggers `simulatePurchase()` or a state reload whenever the physical card or Apple/Google Pay is tapped.

### 2. ISA Savings Pot (Starling Savings Goals)
* **Current mock function**: `getSavingsPot()` in [src/api/index.ts](file:///c:/Users/anton/Documents/CLionProjects/nest2/src/api/index.ts)
* **Starling API Endpoint**:  
  `GET /api/v2/account/{accountUid}/savings-goals`
* Identify or create the goal named `"Cash ISA Pot"` via `PUT /api/v2/account/{accountUid}/savings-goals`.

### 3. Automatic 2% Micro-Transfer to ISA Pot
* **Current mock function**: `simulatePurchase()` in [src/api/index.ts](file:///c:/Users/anton/Documents/CLionProjects/nest2/src/api/index.ts)
* **Starling API Endpoint**:  
  `PUT /api/v2/account/{accountUid}/savings-goals/{savingsGoalUid}/add-money/{transferUid}`  
  Body: `{"amount": {"currency": "GBP", "minorUnits": purchaseAmountMinor * 0.02}}`

### 4. Sunday Leftover Sweep
* **Current mock function**: `closeWeek()` in [src/api/index.ts](file:///c:/Users/anton/Documents/CLionProjects/nest2/src/api/index.ts)
* **Starling API Execution**:  
  When closing a week with positive balance, transfer `leftoverMinorUnits` to `{savingsGoalUid}` via the same `add-money` endpoint.

---

## 📁 Code Structure

```text
src/
├── api/
│   ├── index.ts           # Data service layer (ready for Starling API swap)
│   └── mockData.ts        # 20+ realistic UK merchants & initial week state
├── components/
│   ├── BudgetHeader.tsx   # Hero budget remaining card, streak flame, & stats
│   ├── Header.tsx         # Brand header, live ISA counter pill, demo reset
│   ├── Navbar.tsx         # Responsive desktop/mobile navigation bar
│   ├── SimulatePurchaseModal.tsx # 1-click presets & dynamic calculation preview
│   ├── TransactionFeed.tsx # Filterable transaction feed with 2% badges
│   └── TransactionItem.tsx # Individual transaction item with category styling
├── context/
│   └── NestContext.tsx    # Reactive state provider
├── lib/
│   ├── math.ts            # Pure functions (Rules 1-5, weeklyBudget, applyPurchase, closeWeek)
│   └── math.test.ts       # 9 unit tests verifying all rules & edge cases
├── pages/
│   ├── Dashboard.tsx      # Main "This Week" view
│   ├── SavingsPotPage.tsx # ISA Pot breakdown and Recharts weekly graph
│   ├── SettingsPage.tsx   # Monthly spare money input & live weekly formula
│   └── WeekSummaryPage.tsx# Sunday close week showpiece (placeholder for next step)
└── types/
    └── index.ts           # Strongly typed domain models
```

---

#
