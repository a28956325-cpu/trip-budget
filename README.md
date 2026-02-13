# TravelSplit 旅行分帳神器

A comprehensive, full-featured travel expense splitting and budgeting web application. Think of it as a smarter Splitwise combined with a corporate finance tool, designed to help families, friends, or anyone traveling together manage their expenses efficiently.

![TravelSplit](https://img.shields.io/badge/version-1.0.0-blue) ![React](https://img.shields.io/badge/React-18.2-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178c6) ![Tailwind](https://img.shields.io/badge/Tailwind-3.3-38bdf8)

## ✨ Features

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
- **Flexible Splitting**: Split expenses equally, by exact amounts, or by percentage

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
- **Visual Settlement Plan**: Clear visualization of who owes whom
- **Balance Overview**: See everyone's net position at a glance
- **Greedy Algorithm**: Efficiently calculates the optimal settlement path

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
- **Bilingual Interface**: Chinese and English labels throughout
- **Toast Notifications**: Feedback for all actions
- **Empty States**: Helpful messages and calls-to-action when no data exists
- **Loading States**: Visual feedback during OCR processing
- **Responsive Design**: Works beautifully on all screen sizes

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
│   │   ├── CategoryIcon.tsx
│   │   ├── PersonAvatar.tsx
│   │   ├── ExpenseCard.tsx
│   │   ├── SummaryCard.tsx
│   │   ├── ReceiptUploader.tsx
│   │   ├── SplitSelector.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── Toast.tsx
│   ├── pages/             # Page components
│   │   ├── HomePage.tsx
│   │   ├── TripDashboard.tsx
│   │   ├── AddExpense.tsx
│   │   ├── ExpensesList.tsx
│   │   ├── PeoplePage.tsx
│   │   ├── SettlementPage.tsx
│   │   └── ExportPage.tsx
│   ├── types/             # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── storage.ts     # LocalStorage operations
│   │   ├── settlement.ts  # Debt settlement algorithm
│   │   ├── excel.ts       # Excel export
│   │   ├── ocr.ts         # Tesseract.js integration
│   │   ├── categories.ts  # Category definitions
│   │   └── helpers.ts     # General helpers
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
The split selector intelligently handles three methods:
- **Equal**: Automatically divides total by number of people
- **Exact**: Validates that sum equals total amount
- **Percentage**: Calculates amounts from percentages

### Settlement Algorithm
Uses a greedy approach to minimize transactions:
1. Calculate net balance for each person (paid - owed)
2. Separate into debtors (negative balance) and creditors (positive balance)
3. Match largest debtor with largest creditor
4. Continue until all balances are settled

This minimizes the number of transactions needed to settle all debts.

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

- Data is stored in browser localStorage (clear browser data = lose trips)
- OCR accuracy depends on receipt image quality
- No backend sync between devices
- Maximum localStorage size varies by browser (~5-10MB)

## 💡 Tips & Tricks

1. **Backup Your Data**: Regularly export to Excel as a backup
2. **Clear Receipt Photos**: Better image quality = better OCR results
3. **Add People First**: You can't add expenses without adding people
4. **Check Split Totals**: For exact/percentage splits, verify totals match
5. **Use Categories Consistently**: Makes the breakdown chart more useful

## 🤝 Contributing

This is a personal project, but suggestions and bug reports are welcome!

## 📝 License

MIT License - Feel free to use this project for your own trips!

## 🙏 Acknowledgments

- Built with React, TypeScript, and modern web technologies
- Inspired by Splitwise and expense tracking needs
- OCR powered by Tesseract.js
- Charts by Recharts
- Styling with Tailwind CSS

---

**Happy Traveling! 🌍✈️**

Made with ❤️ for better trip expense management
