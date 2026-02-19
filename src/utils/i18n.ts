export type Language = 'zh-TW' | 'en';

export const translations = {
  'zh-TW': {
    // Navigation
    'nav.home': '首頁',
    'nav.dashboard': '儀表板',
    'nav.expenses': '支出列表',
    'nav.addExpense': '新增支出',
    'nav.people': '人員管理',
    'nav.settlement': '結算',
    'nav.export': '匯出',
    
    // Home
    'home.title': 'TravelSplit 旅行分帳神器',
    'home.subtitle': '讓分帳變得簡單又公平',
    'home.createTrip': '建立新行程',
    'home.tripName': '行程名稱',
    'home.startDate': '開始日期',
    'home.endDate': '結束日期',
    'home.currency': '幣別',
    'home.description': '描述',
    'home.noTrips': '還沒有行程，建立一個吧！',
    'home.deleteConfirm': '確定要刪除這個行程嗎？',
    
    // Dashboard
    'dashboard.totalExpenses': '總支出',
    'dashboard.numExpenses': '支出筆數',
    'dashboard.numPeople': '人數',
    'dashboard.avgPerPerson': '人均花費',
    'dashboard.categoryBreakdown': '類別分佈',
    'dashboard.perPersonSpending': '個人花費',
    'dashboard.paymentOverview': '墊付概況',
    'dashboard.spending': '花費',
    'dashboard.paid': '墊付',
    'dashboard.share': '分攤',
    'dashboard.netBalance': '淨額',
    'dashboard.recentExpenses': '最近的支出',
    'dashboard.quickActions': '快速操作',
    
    // Expense
    'expense.add': '新增支出',
    'expense.edit': '編輯支出',
    'expense.description': '描述',
    'expense.amount': '金額',
    'expense.date': '日期',
    'expense.category': '類別',
    'expense.paidBy': '付款人',
    'expense.splitMethod': '分帳方式',
    'expense.splitEqual': '平均分攤',
    'expense.splitExact': '指定金額',
    'expense.splitPercentage': '依百分比',
    'expense.splitByItems': '按品項拆分',
    'expense.notes': '備註',
    'expense.save': '儲存',
    'expense.cancel': '取消',
    'expense.delete': '刪除',
    'expense.deleteConfirm': '確定要刪除這筆支出嗎？',
    'expense.uploadReceipt': '上傳收據',
    'expense.analyzing': '🔍 正在辨識收據...',
    'expense.autoDetected': '✨ 自動辨識',
    'expense.noExpenses': '還沒有支出紀錄',
    'expense.total': '總計',
    'expense.filter': '篩選',
    'expense.sort': '排序',
    'expense.all': '全部',
    
    // Items
    'items.addItem': '新增品項',
    'items.itemName': '品項名稱',
    'items.itemAmount': '金額',
    'items.splitAmong': '分攤者',
    'items.removeItem': '移除',
    'items.totalMismatch': '⚠️ 品項總額與支出金額不符',
    'items.splitRemaining': '剩餘金額平均分攤',
    'items.summary': '每人分攤摘要',
    
    // People
    'people.title': '人員管理',
    'people.addPerson': '新增成員',
    'people.name': '姓名',
    'people.totalPaid': '已付金額',
    'people.totalOwed': '應付金額',
    'people.totalSpending': '總花費',
    'people.balance': '餘額',
    'people.cannotRemove': '此成員有相關支出，無法移除',
    'people.noPeople': '還沒有成員，新增一位吧！',
    
    // Settlement
    'settlement.title': '結算',
    'settlement.balanceOverview': '餘額總覽',
    'settlement.plan': '結算方案',
    'settlement.pays': '付給',
    'settlement.isOwed': '應收',
    'settlement.owes': '應付',
    'settlement.settled': '已結清',
    'settlement.markSettled': '標記為已結清',
    'settlement.noSettlement': '沒有需要結算的項目',
    'settlement.easySettlement': '簡化結算',
    'settlement.transferCount': '只需 {count} 筆轉帳',
    'settlement.share': '分享結算結果',
    'settlement.copyToClipboard': '複製到剪貼簿',
    'settlement.copied': '已複製！',
    'settlement.shareViaLine': '透過 LINE 分享',
    'settlement.shareViaEmail': '透過 Email 分享',
    'settlement.reminderSent': '提醒已發送！',
    
    // Export
    'export.title': '匯出報表',
    'export.download': '下載 Excel',
    'export.preview': '預覽',
    'export.sheetSummary': '摘要',
    'export.sheetExpenses': '所有支出',
    'export.sheetPerPerson': '個人明細',
    'export.sheetCategories': '類別統計',
    'export.sheetSettlement': '結算方案',
    
    // Categories
    'category.food': '🍽️ 食 Food',
    'category.clothing': '👕 衣 Clothing',
    'category.accommodation': '🏨 住 Accommodation',
    'category.transport': '🚗 行 Transport',
    'category.education': '📚 育 Education',
    'category.entertainment': '🎮 樂 Entertainment',
    'category.other': '📦 其他 Other',
    
    // Budget
    'budget.title': '預算管理',
    'budget.setTotal': '設定總預算',
    'budget.setCategory': '設定類別預算',
    'budget.spent': '已花費',
    'budget.remaining': '剩餘',
    'budget.overBudget': '⚠️ 超過預算！',
    'budget.progress': '進度',
    'budget.warning': '🚨 已使用預算的 {percent}%！',
    
    // Currency
    'currency.title': '幣別設定',
    'currency.convert': '匯率換算',
    'currency.baseCurrency': '基準幣別',
    'currency.rate': '匯率',
    'currency.lastUpdated': '匯率更新時間',
    
    // Common
    'common.save': '儲存',
    'common.cancel': '取消',
    'common.delete': '刪除',
    'common.edit': '編輯',
    'common.confirm': '確認',
    'common.back': '返回',
    'common.loading': '載入中...',
    'common.error': '發生錯誤',
    'common.success': '成功！',
    'common.language': '語言',
    'common.switchLang': 'Switch to English',
  },
  'en': {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.expenses': 'Expenses',
    'nav.addExpense': 'Add Expense',
    'nav.people': 'People',
    'nav.settlement': 'Settlement',
    'nav.export': 'Export',
    
    // Home
    'home.title': 'TravelSplit',
    'home.subtitle': 'Split expenses fairly and easily',
    'home.createTrip': 'Create New Trip',
    'home.tripName': 'Trip Name',
    'home.startDate': 'Start Date',
    'home.endDate': 'End Date',
    'home.currency': 'Currency',
    'home.description': 'Description',
    'home.noTrips': 'No trips yet. Create one!',
    'home.deleteConfirm': 'Are you sure you want to delete this trip?',
    
    // Dashboard
    'dashboard.totalExpenses': 'Total Expenses',
    'dashboard.numExpenses': 'Number of Expenses',
    'dashboard.numPeople': 'People',
    'dashboard.avgPerPerson': 'Average per Person',
    'dashboard.categoryBreakdown': 'Category Breakdown',
    'dashboard.perPersonSpending': 'Per-Person Spending',
    'dashboard.paymentOverview': 'Payment Overview',
    'dashboard.spending': 'Spending',
    'dashboard.paid': 'Paid',
    'dashboard.share': 'Share',
    'dashboard.netBalance': 'Net Balance',
    'dashboard.recentExpenses': 'Recent Expenses',
    'dashboard.quickActions': 'Quick Actions',
    
    // Expense
    'expense.add': 'Add Expense',
    'expense.edit': 'Edit Expense',
    'expense.description': 'Description',
    'expense.amount': 'Amount',
    'expense.date': 'Date',
    'expense.category': 'Category',
    'expense.paidBy': 'Paid By',
    'expense.splitMethod': 'Split Method',
    'expense.splitEqual': 'Split Equally',
    'expense.splitExact': 'Exact Amounts',
    'expense.splitPercentage': 'By Percentage',
    'expense.splitByItems': 'Split by Items',
    'expense.notes': 'Notes',
    'expense.save': 'Save',
    'expense.cancel': 'Cancel',
    'expense.delete': 'Delete',
    'expense.deleteConfirm': 'Are you sure you want to delete this expense?',
    'expense.uploadReceipt': 'Upload Receipt',
    'expense.analyzing': '🔍 Analyzing receipt...',
    'expense.autoDetected': '✨ Auto-detected',
    'expense.noExpenses': 'No expenses yet',
    'expense.total': 'Total',
    'expense.filter': 'Filter',
    'expense.sort': 'Sort',
    'expense.all': 'All',
    
    // Items
    'items.addItem': 'Add Item',
    'items.itemName': 'Item Name',
    'items.itemAmount': 'Amount',
    'items.splitAmong': 'Split Among',
    'items.removeItem': 'Remove',
    'items.totalMismatch': '⚠️ Items total does not match expense amount',
    'items.splitRemaining': 'Split Remaining Equally',
    'items.summary': 'Per-Person Summary',
    
    // People
    'people.title': 'People',
    'people.addPerson': 'Add Person',
    'people.name': 'Name',
    'people.totalPaid': 'Total Paid',
    'people.totalOwed': 'Total Owed',
    'people.totalSpending': 'Total Spending',
    'people.balance': 'Balance',
    'people.cannotRemove': 'Cannot remove: this person has expenses',
    'people.noPeople': 'No people yet. Add someone!',
    
    // Settlement
    'settlement.title': 'Settlement',
    'settlement.balanceOverview': 'Balance Overview',
    'settlement.plan': 'Settlement Plan',
    'settlement.pays': 'pays',
    'settlement.isOwed': 'is owed',
    'settlement.owes': 'owes',
    'settlement.settled': 'Settled',
    'settlement.markSettled': 'Mark as Settled',
    'settlement.noSettlement': 'No settlements needed',
    'settlement.easySettlement': 'Easy Settlement',
    'settlement.transferCount': 'Only {count} transfers needed',
    'settlement.share': 'Share Settlement',
    'settlement.copyToClipboard': 'Copy to Clipboard',
    'settlement.copied': 'Copied!',
    'settlement.shareViaLine': 'Share via LINE',
    'settlement.shareViaEmail': 'Share via Email',
    'settlement.reminderSent': 'Reminder sent!',
    
    // Export
    'export.title': 'Export Report',
    'export.download': 'Download Excel',
    'export.preview': 'Preview',
    'export.sheetSummary': 'Summary',
    'export.sheetExpenses': 'All Expenses',
    'export.sheetPerPerson': 'Per-Person',
    'export.sheetCategories': 'Categories',
    'export.sheetSettlement': 'Settlement',
    
    // Categories
    'category.food': '🍽️ Food',
    'category.clothing': '👕 Clothing',
    'category.accommodation': '🏨 Accommodation',
    'category.transport': '🚗 Transport',
    'category.education': '📚 Education',
    'category.entertainment': '🎮 Entertainment',
    'category.other': '📦 Other',
    
    // Budget
    'budget.title': 'Budget',
    'budget.setTotal': 'Set Total Budget',
    'budget.setCategory': 'Set Category Budget',
    'budget.spent': 'Spent',
    'budget.remaining': 'Remaining',
    'budget.overBudget': '⚠️ Over budget!',
    'budget.progress': 'Progress',
    'budget.warning': '🚨 {percent}% of budget used!',
    
    // Currency
    'currency.title': 'Currency Settings',
    'currency.convert': 'Convert',
    'currency.baseCurrency': 'Base Currency',
    'currency.rate': 'Exchange Rate',
    'currency.lastUpdated': 'Last Updated',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.error': 'Error occurred',
    'common.success': 'Success!',
    'common.language': 'Language',
    'common.switchLang': '切換至中文',
  }
};

export type TranslationKey = keyof typeof translations['en'];

export const getTranslation = (language: Language, key: TranslationKey): string => {
  return translations[language][key] || key;
};

export const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language;
  if (browserLang.startsWith('zh')) {
    return 'zh-TW';
  }
  return 'en';
};
