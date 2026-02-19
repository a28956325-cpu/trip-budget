# TravelSplit 旅行分帳神器

A comprehensive, full-featured travel expense splitting and budgeting web application. **The most powerful expense splitting app** - better than Splitwise Pro with item-level splitting, multi-currency support, budget tracking, CSV import, and instant settlement sharing.

![TravelSplit](https://img.shields.io/badge/version-2.0.0-blue) ![React](https://img.shields.io/badge/React-18.2-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6) ![Tailwind](https://img.shields.io/badge/Tailwind-3.3-38bdf8)

## ✨ New in Version 2.0

### 🆕 Item-Level Splitting (品項級別拆分)
The #1 feature Splitwise cannot do well! Split restaurant bills by individual items:
- Add multiple items to a single expense (e.g., appetizers, entrees, drinks)
- Assign different people to each item
- Automatic per-person calculation
- Visual summary showing everyone's share
- Example: Alice and Bob share dumplings, but only Bob gets the beer

### 🌐 Full Internationalization (完整中英雙語)
- **One-click language toggle** between Traditional Chinese (繁體中文) and English
- 🇹🇼 / 🇺🇸 flag icons in header
- Every page, button, label, and message translated
- Language preference saved in browser
- Auto-detects browser language on first visit

### 💱 Multi-Currency Support (多幣別支援)
- **12 supported currencies**: TWD, USD, JPY, EUR, GBP, KRW, THB, CNY, HKD, SGD, AUD, CAD
- Each expense can have its own currency
- Automatic conversion to trip base currency for settlement
- Real exchange rates (with static fallback)
- Display both original and converted amounts

### 📊 Budget Management (預算管理)
- Set **total trip budget**
- Set **per-category budgets** (optional)
- Real-time progress bars with color-coded warnings:
  - 🟢 Green: 0-70%
  - 🟡 Yellow: 70-90%
  - 🔴 Red: 90%+
- Overspending alerts
- Budget overview on dashboard

### 📤 Settlement Sharing (結算分享)
Generate formatted settlement messages and share via:
- **📋 Copy to Clipboard** - One-click copy
- **💬 LINE** - Share via LINE app (popular in Asia)
- **💚 WhatsApp** - International messaging
- **📧 Email** - Traditional email sharing
- **📱 Native Share** - Use device's share menu (mobile)
- Includes bank transfer info if provided
- Send payment reminders for unsettled debts

### 📂 CSV Import (信用卡帳單匯入)
- **Upload bank/credit card CSV statements**
- Auto-detect column headers (Date, Description, Amount)
- Preview all transactions before importing
- Check/uncheck which to import
- Auto-suggest categories based on merchant names
- Bulk import multiple expenses at once
- Supports common bank formats (US, Taiwan, international)

## 🎯 Core Features

### 🏠 Trip Management
- **Create Multiple Trips**: Manage multiple travel adventures with custom names, dates, and currencies
- **Trip Dashboard**: Comprehensive overview with summary cards, charts, and quick actions
- **Beautiful UI**: Modern, responsive design that works seamlessly on mobile and desktop

### 💰 Expense Tracking
- **Multi-Category Support**: Track expenses across 7 categories
  - 🍽️ Food (食)
  - 👕 Clothing (衣)
  - 🏨 Accommodation (住)
  - 🚗 Transport (行)
  - 📚 Education (育)
  - 🎮 Entertainment (樂)
  - 📦 Other (其他)
- **Receipt Upload**: Upload JPG, PNG, or PDF receipts
- **OCR Technology**: Automatic text extraction from receipt images using Tesseract.js
- **Smart Amount Detection**: Automatically detects amounts from receipt text
- **Advanced Splitting Methods**:
  - **Equal**: Split evenly among selected people
  - **Exact**: Enter specific amounts for each person
  - **Percentage**: Assign percentages (must total 100%)
  - **🆕 By Items**: Split by individual receipt items (the Splitwise killer feature!)

### 👥 People Management
- **Add/Remove Travelers**: Manage your travel companions
- **Color-Coded Avatars**: Automatic avatar generation with unique colors
- **Balance Tracking**: See each person's total paid, owed, and net balance
- **Smart Deletion Protection**: Cannot remove people with assigned expenses

### 📊 Advanced Analytics
- **Category Breakdown**: Pie chart visualization of spending by category
- **Per-Person Spending**: Bar chart showing what each person paid vs. owed
- **Recent Expenses**: Quick view of the latest transactions
- **Real-time Calculations**: All totals and balances update instantly

### 💵 Intelligent Settlement
- **Minimized Transactions**: Smart algorithm to minimize the number of payments needed
- **Multi-Currency Support**: Automatically converts all expenses to base currency
- **Item-Level Awareness**: Correctly calculates splits from item-level expenses
- **Visual Settlement Plan**: Clear visualization of who owes whom
- **Balance Overview**: See everyone's net position at a glance
- **🆕 Share Settlement**: Instantly share results via LINE, WhatsApp, Email, or copy to clipboard
- **🆕 Bank Transfer Info**: Add bank account details for easy payments
- **🆕 Payment Reminders**: Send friendly reminders for unsettled debts

### 📥 Excel Export
- **Comprehensive Reports**: 5-sheet Excel workbook with all trip data
  - **Summary Sheet**: Trip overview and key statistics
  - **All Expenses Sheet**: Complete expense log with all details
  - **Per-Person Breakdown**: Individual spending analysis
  - **Category Breakdown**: Spending by category with percentages
  - **Settlement Sheet**: Who owes whom and how much
- **Well-Formatted**: Professional formatting with headers and proper structure
- **Download Instantly**: One-click download with SheetJS

### 🔍 Expense Management
- **Filter & Sort**: Filter by category, person, or date; sort by date or amount
- **Edit & Delete**: Full CRUD operations on all expenses
- **Detailed View**: See all expense details including split information
- **Confirmation Dialogs**: Safety checks before deleting items

### 🎨 User Experience
- **🆕 Dual Language Interface**: Toggle between Chinese (繁體中文) and English instantly
- **Toast Notifications**: Feedback for all actions
- **Empty States**: Helpful messages and calls-to-action when no data exists
- **Loading States**: Visual feedback during OCR processing
- **Responsive Design**: Works beautifully on mobile and desktop
- **Dark Mode Ready**: Modern gradient designs
- **Smooth Animations**: Hover effects and transitions

## 🚀 Why TravelSplit is Better than Splitwise

| Feature | TravelSplit | Splitwise Pro |
|---------|-------------|---------------|
| **Item-Level Splitting** | ✅ Full support with visual UI | ❌ Not available |
| **Multi-Currency** | ✅ 12 currencies + auto-conversion | ✅ Limited |
| **Language Support** | ✅ Chinese + English (instant toggle) | ⚠️ English only |
| **Budget Tracking** | ✅ Per-trip + per-category | ❌ Not available |
| **CSV Import** | ✅ Bulk import from bank statements | ❌ Not available |
| **Share Settlement** | ✅ LINE/WhatsApp/Email/Clipboard | ⚠️ Limited sharing |
| **Receipt OCR** | ✅ Auto-extract amounts | ✅ Available |
| **Excel Export** | ✅ 5-sheet comprehensive report | ⚠️ Basic CSV only |
| **Privacy** | ✅ 100% offline, no cloud | ❌ Requires account + cloud |
| **Cost** | ✅ Free & Open Source | 💰 $2.99/month |

## 📖 Usage Examples

### Example 1: Restaurant with Item-Level Splitting

**Scenario**: Dinner at Din Tai Fung with 4 friends

1. Create expense "Din Tai Fung Dinner" - $155 TWD
2. Select "Split by Items" method
3. Add items:
   - 🥟 Xiao Long Bao $250 → Alice, Bob, Charlie
   - 🥩 Steak $800 → Alice, Bob
   - 🍺 Beer $500 → Bob, David
   - 💰 Service charge $155 → All (use "Split Remaining")
4. Auto-calculates: Alice $517, Bob $892, Charlie $83, David $250
5. Save and settlement is automatically updated

### Example 2: Multi-Currency Trip

**Scenario**: Japan vacation with mixed expenses

1. Set trip base currency: TWD
2. Add expenses:
   - Hotel: ¥15,000 JPY (selected from currency dropdown)
   - Train: ¥8,000 JPY
   - Breakfast: $25 USD (paid at airport)
3. All amounts auto-convert to TWD for settlement
4. Shows both original and converted amounts

### Example 3: CSV Import

**Scenario**: Import credit card statement

1. Go to Expenses → Click "Import CSV"
2. Upload bank CSV file
3. Preview shows all transactions
4. Select which ones to import (check/uncheck)
5. Assign categories (auto-suggested)
6. Choose who paid and split method
7. Bulk import creates all expenses at once

## 🛠️ Tech Stack

- **React 18+** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Recharts** - Beautiful charts and visualizations
- **SheetJS (xlsx)** - Excel file generation
- **Tesseract.js** - Client-side OCR
- **pdfjs-dist** - PDF preview rendering
- **uuid** - Unique ID generation
- **LocalStorage** - Client-side data persistence

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd trip-budget

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## 📖 Usage Guide

### Creating Your First Trip

1. **Start from Home**: Click "Create New Trip" on the home page
2. **Fill Trip Details**: 
   - Trip name (e.g., "Summer Vacation 2024")
   - Description
   - Currency (USD, EUR, TWD, etc.)
   - Start and end dates
3. **Add People**: Navigate to "Manage People" and add all travelers
4. **Add Expenses**: Start tracking expenses with the "Add Expense" button

### Adding an Expense

1. **Basic Info**: Enter description, amount, date, and category
2. **Payment**: Select who paid for this expense
3. **Receipt (Optional)**: Upload a receipt image or PDF
   - For images: OCR will try to extract text and detect amounts
   - For PDFs: Preview of first page is shown
4. **Split Method**: Choose how to split:
   - **Equal**: Split evenly among selected people
   - **Exact**: Enter specific amounts for each person
   - **Percentage**: Assign percentages (must total 100%)
5. **Select People**: Choose who should share this expense
6. **Save**: Review and save the expense

### Viewing Settlement

1. Go to the **Settlement** page from the dashboard
2. See each person's balance (positive = owed money, negative = owes money)
3. View the simplified settlement plan showing minimum transactions needed
4. Share this with your group to settle up efficiently

### Exporting Data

1. Navigate to **Export** page
2. Preview what will be included in the Excel file
3. Click "Download Excel File" to get your comprehensive report
4. Share the file with your travel companions or keep for records

## 📁 Project Structure

```
trip-budget/
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Layout.tsx
│   │   ├── LanguageToggle.tsx        # 🆕 Language switcher
│   │   ├── CategoryIcon.tsx
│   │   ├── PersonAvatar.tsx
│   │   ├── ExpenseCard.tsx
│   │   ├── SummaryCard.tsx
│   │   ├── ReceiptUploader.tsx
│   │   ├── SplitSelector.tsx
│   │   ├── ItemSplitter.tsx          # 🆕 Item-level split UI
│   │   ├── CurrencySelector.tsx      # 🆕 Currency dropdown
│   │   ├── BudgetProgress.tsx        # 🆕 Budget bars
│   │   ├── ShareSettlement.tsx       # 🆕 Share buttons
│   │   ├── CSVImporter.tsx           # 🆕 CSV upload modal
│   │   ├── ConfirmDialog.tsx
│   │   └── Toast.tsx
│   ├── contexts/           # React contexts
│   │   └── I18nContext.tsx           # 🆕 i18n provider
│   ├── pages/             # Page components
│   │   ├── HomePage.tsx
│   │   ├── TripDashboard.tsx
│   │   ├── AddExpense.tsx
│   │   ├── ExpensesList.tsx
│   │   ├── PeoplePage.tsx
│   │   ├── SettlementPage.tsx
│   │   ├── BudgetPage.tsx            # 🆕 Budget management
│   │   └── ExportPage.tsx
│   ├── types/             # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── storage.ts     # LocalStorage operations
│   │   ├── settlement.ts  # Multi-currency settlement
│   │   ├── excel.ts       # Excel export
│   │   ├── ocr.ts         # Tesseract.js integration
│   │   ├── categories.ts  # Category definitions
│   │   ├── helpers.ts     # General helpers
│   │   ├── i18n.ts        # 🆕 Translations
│   │   ├── currency.ts    # 🆕 Exchange rates
│   │   ├── sharing.ts     # 🆕 Settlement sharing
│   │   └── csv.ts         # 🆕 CSV parser
│   ├── App.tsx            # Main app component with routing
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 🔑 Key Features Deep Dive

### Smart Split Algorithm
The split selector intelligently handles **four methods**:
- **Equal**: Automatically divides total by number of people
- **Exact**: Validates that sum equals total amount
- **Percentage**: Calculates amounts from percentages
- **🆕 By Items**: Splits based on individual receipt items - each person only pays for what they ordered

### Item-Level Splitting Algorithm
When splitting by items:
1. Each item has a list of people who share it
2. Item amount is divided equally among those people
3. Each person's total is sum of their shares across all items
4. Validation ensures item totals match expense total
5. "Split Remaining" button distributes any remainder equally

### Settlement Algorithm
Uses a greedy approach to minimize transactions with multi-currency support:
1. Convert all expenses to base currency using exchange rates
2. Calculate net balance for each person (paid - owed)
3. Handle item-level splits by aggregating person shares
4. Separate into debtors (negative balance) and creditors (positive balance)
5. Match largest debtor with largest creditor
6. Continue until all balances are settled

This minimizes the number of transactions needed and handles complex scenarios with multiple currencies and item-level splits.

### Data Persistence
All data is stored in browser localStorage:
- No backend required
- Works offline
- Data persists between sessions
- Export to Excel for backups

### OCR Integration
Receipt image processing:
1. User uploads JPG/PNG image
2. Tesseract.js extracts text
3. Pattern matching tries to detect currency amounts
4. Suggested amount auto-fills (user can edit)

## 🎨 Design Philosophy

- **Clean & Modern**: Card-based design with shadows and rounded corners
- **Color Coded**: Each category has a distinct color for easy recognition
- **Responsive First**: Mobile-friendly design that scales to desktop
- **Bilingual**: Chinese and English labels for international users
- **Accessible**: Clear visual hierarchy and readable fonts
- **Feedback**: Toast notifications for all user actions

## 🔒 Data Privacy

- **100% Client-Side**: No data sent to any server
- **LocalStorage Only**: All data stays in your browser
- **No Tracking**: No analytics or tracking scripts
- **Export Control**: You control your data via Excel export

## 🐛 Known Limitations

- **Data is stored in browser localStorage** - Clearing browser data will delete all trips (use Excel export for backups!)
- **No cloud sync** - Each device has its own local data, cannot sync between devices
- **OCR accuracy varies** - Depends on receipt image quality and format
- **Static exchange rates** - Uses predefined rates, not live API (can be easily updated in code)
- **Maximum localStorage size** - Varies by browser (~5-10MB, sufficient for most trips)
- **CSV format detection** - Works with common formats but may need manual column mapping for unusual formats

## 💡 Tips & Tricks

1. **🆕 Use Item-Level Splitting for Restaurants**: Instead of splitting the bill equally, add each dish separately and assign who ordered it
2. **🆕 Set Budgets Early**: Define your budget before the trip starts, then track progress in real-time
3. **🆕 Import Bank Statements**: Use CSV import to bulk-add expenses from your credit card statement at end of trip
4. **🆕 Share Settlement via LINE**: In Asia? Use LINE sharing for instant payment reminders
5. **🆕 Switch Languages**: Toggle between Chinese and English based on your group's preference
6. **Backup Your Data**: Regularly export to Excel as a backup (localStorage can be cleared)
7. **Clear Receipt Photos**: Better image quality = better OCR results
8. **Use Consistent Categories**: Makes analytics and budgeting more meaningful
9. **Add Bank Info**: Include bank transfer details on People page for easier settlements
10. **Multi-Currency Trips**: Set your home currency as base, then add expenses in local currencies

## 🎓 Best Practices

- **Start Simple**: Begin with basic equal splits, then use advanced features as needed
- **Daily Updates**: Add expenses daily rather than trying to remember everything at trip end
- **Category Budgets**: Set realistic budgets for each category based on destination
- **Item Splitting for Groups**: Essential for group dinners where people order differently
- **Regular Exports**: Download Excel reports weekly for complex/long trips

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome!

## 📝 License

MIT License - Feel free to use this project for your own trips!

## 🙏 Acknowledgments

- **Built with React 18 + TypeScript** - Type-safe modern development
- **Inspired by Splitwise** - But made better with item-level splitting!
- **OCR powered by Tesseract.js** - Client-side text extraction
- **Charts by Recharts** - Beautiful data visualizations
- **Styling with Tailwind CSS** - Utility-first responsive design
- **Icons from Heroicons** - Clean SVG icons
- **Exchange rate data** - Static rates for 12 major currencies
- **Designed for Asian travelers** - Chinese language support, LINE integration, local currencies

## 🌟 Why We Built This

Traditional expense splitters like Splitwise fall short when dining out with friends where everyone orders different items. In Asia especially, where communal dining is common but people still want fair splits, this becomes a real pain point. 

**TravelSplit solves this** with true item-level splitting, letting you assign each dish to specific people. Add multi-currency support for international travel, budget tracking to avoid overspending, instant settlement sharing via LINE or WhatsApp, and a beautiful bilingual interface - and you have the most powerful travel expense app available.

**Best of all**: It's 100% free, open source, and works offline with no account required!

---

**Happy Traveling! 🌍✈️**

Made with ❤️ for better trip expense management

*Version 2.0 - The Splitwise Killer*
