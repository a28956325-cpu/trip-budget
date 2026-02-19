import { createWorker } from 'tesseract.js';
import { ExpenseCategory, ParsedReceipt } from '../types';

export const performOCR = async (imageData: string): Promise<string> => {
  try {
    const worker = await createWorker('eng');
    const { data } = await worker.recognize(imageData);
    await worker.terminate();
    return data.text;
  } catch (error) {
    console.error('OCR error:', error);
    return '';
  }
};

// Extract amount with enhanced currency support and total detection
export const extractAmountFromText = (text: string): { amount: number | null; confidence: 'high' | 'medium' | 'low' | 'none' } => {
  const lines = text.split('\n');
  const amounts: Array<{ value: number; priority: number; line: string }> = [];

  // Priority keywords for total amounts
  const totalKeywords = [
    'grand total', 'total amount', 'amount due', 'balance due',
    '合計', '總計', '小計', '應付', '金額',
    'net', 'total', 'amount', 'sum'
  ];

  // Enhanced currency patterns
  const currencyPatterns = [
    /[$＄]\s*(\d{1,3}(?:[,，]\d{3})*(?:[.,．]\d{2})?)/gi,  // $1,234.56 or ＄1,234.56
    /NT\$?\s*(\d{1,3}(?:[,，]\d{3})*(?:[.,．]\d{2})?)/gi,  // NT$1,234 or NT1234
    /[¥￥]\s*(\d{1,3}(?:[,，]\d{3})*(?:[.,．]\d{2})?)/gi,  // ¥1,234 or ￥1,234
    /[€]\s*(\d{1,3}(?:[,，]\d{3})*(?:[.,．]\d{2})?)/gi,   // €50.00
    /[£]\s*(\d{1,3}(?:[,，]\d{3})*(?:[.,．]\d{2})?)/gi,   // £30.00
    /(\d{1,3}(?:[,，]\d{3})*(?:[.,．]\d{2})?)\s*(?:USD|usd|TWD|twd|EUR|eur|GBP|gbp)/gi,  // 1234.56 USD
    /(\d{1,3}(?:[,，]\d{3})*[.,．]\d{2})/g  // Plain numbers with decimals like 1234.56
  ];

  // Process each line
  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    let linePriority = 0;

    // Check if line contains total keywords
    const hasTotalKeyword = totalKeywords.some(keyword => 
      lowerLine.includes(keyword.toLowerCase())
    );
    if (hasTotalKeyword) {
      linePriority = 10;
    }

    // Extract all amounts from this line
    currencyPatterns.forEach(pattern => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        const numStr = match[1] || match[0];
        const cleanNum = numStr.replace(/[,，]/g, '').replace(/[．]/g, '.');
        const amount = parseFloat(cleanNum);
        
        if (!isNaN(amount) && amount > 0 && amount < 1000000) {
          // Bonus priority for amounts at the end of receipt
          const positionBonus = index > lines.length / 2 ? 2 : 0;
          amounts.push({
            value: amount,
            priority: linePriority + positionBonus,
            line: line.trim()
          });
        }
      }
    });
  });

  if (amounts.length === 0) {
    return { amount: null, confidence: 'none' };
  }

  // Sort by priority, then by value (largest first)
  amounts.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return b.value - a.value;
  });

  const selectedAmount = amounts[0].value;
  const hasHighPriorityMatch = amounts[0].priority >= 10;
  const confidence = hasHighPriorityMatch ? 'high' : (amounts.length > 3 ? 'medium' : 'low');

  return { amount: selectedAmount, confidence };
};

// Classify category based on keywords in text
export const classifyCategory = (text: string): { category: ExpenseCategory; confidence: 'high' | 'medium' | 'low' | 'none' } => {
  const lowerText = text.toLowerCase();
  
  const categoryKeywords: Record<ExpenseCategory, string[]> = {
    food: [
      'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'dining', 'eat', 'bakery', 
      'bar', 'pub', 'sushi', 'mcdonald', 'starbucks', 'breakfast', 'lunch', 'dinner',
      'uber eats', 'foodpanda', 'deliveroo', 'kfc', 'subway', 'domino',
      '餐廳', '小吃', '飲料', '便當', '火鍋', '壽司', '茶', '早餐', '午餐', '晚餐',
      '咖啡', '麵', '飯', '麥當勞', '肯德基', '星巴克', '美食'
    ],
    accommodation: [
      'hotel', 'hostel', 'airbnb', 'motel', 'inn', 'resort', 'booking', 'agoda',
      'marriott', 'hilton', 'hyatt', 'check-in', 'check-out', 'room', 'suite', 'lodge',
      '飯店', '旅館', '民宿', '住宿', '酒店', '賓館', '旅店'
    ],
    transport: [
      'taxi', 'uber', 'lyft', 'grab', 'bus', 'train', 'metro', 'mrt', 'airline', 'flight',
      'parking', 'gas', 'fuel', 'toll', 'subway', 'railway', 'airport', 'fare', 'ticket', 'transit',
      '捷運', '高鐵', '台鐵', '機票', '加油', '計程車', '公車', '交通', '停車', '過路費'
    ],
    clothing: [
      'clothing', 'fashion', 'apparel', 'shoes', 'uniqlo', 'zara', 'h&m', 'nike', 
      'adidas', 'mall', 'outfit', 'wear', 'dress', 'shirt', 'pants',
      '服飾', '百貨', '鞋', '衣服', '衣', '購物', '服裝'
    ],
    education: [
      'book', 'museum', 'ticket', 'admission', 'tour', 'gallery', 'exhibition',
      'class', 'course', 'workshop', 'bookstore', 'library', 'school', 'university',
      '博物館', '門票', '展覽', '書店', '圖書', '課程', '學習'
    ],
    entertainment: [
      'movie', 'cinema', 'karaoke', 'ktv', 'game', 'amusement', 'theme park', 
      'concert', 'show', 'spa', 'massage', 'entertainment', 'fun', 'activity', 
      'nightclub', 'club', 'theatre', 'arcade',
      '電影', '遊樂', '按摩', '娛樂', '遊戲', '演唱會', '表演', 'spa'
    ],
    other: []
  };

  const scores: Record<ExpenseCategory, number> = {
    food: 0,
    clothing: 0,
    accommodation: 0,
    transport: 0,
    education: 0,
    entertainment: 0,
    other: 0
  };

  // Count keyword matches for each category
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        scores[category as ExpenseCategory] += 1;
      }
    }
  }

  // Find category with highest score
  let maxScore = 0;
  let bestCategory: ExpenseCategory = 'other';
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category as ExpenseCategory;
    }
  }

  // Determine confidence based on score
  let confidence: 'high' | 'medium' | 'low' | 'none' = 'none';
  if (maxScore >= 3) {
    confidence = 'high';
  } else if (maxScore === 2) {
    confidence = 'medium';
  } else if (maxScore === 1) {
    confidence = 'low';
  }

  return { category: bestCategory, confidence };
};

// Extract merchant/description from receipt
export const extractDescription = (text: string): { description: string | null; confidence: 'high' | 'medium' | 'low' | 'none' } => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length === 0) {
    return { description: null, confidence: 'none' };
  }

  // Filter out common non-merchant text
  const excludePatterns = [
    /receipt/i,
    /invoice/i,
    /tax invoice/i,
    /統一發票/,
    /^\d{8}$/,  // 8-digit numbers (tax IDs)
    /^tel[:\s]/i,
    /^phone[:\s]/i,
    /^address[:\s]/i,
    /^add[:\s]/i,
    /電話/,
    /地址/,
    /^[\d\s\-\(\)]+$/,  // Just phone numbers
    /^\d{2,4}[-\/]\d{2}[-\/]\d{2}/  // Dates
  ];

  // Look at first 5 lines for merchant name
  const candidates = lines.slice(0, 5).filter(line => {
    // Skip if matches exclude patterns
    if (excludePatterns.some(pattern => pattern.test(line))) {
      return false;
    }
    // Skip if line is too short or too long
    if (line.length < 3 || line.length > 50) {
      return false;
    }
    return true;
  });

  if (candidates.length === 0) {
    return { description: lines[0].substring(0, 50), confidence: 'low' };
  }

  // Prefer lines in ALL CAPS or title case (typical for store names)
  const allCapsLine = candidates.find(line => line === line.toUpperCase() && line.length > 3);
  if (allCapsLine) {
    return { description: allCapsLine, confidence: 'high' };
  }

  // Prefer shorter lines (1-4 words)
  const shortLine = candidates.find(line => line.split(/\s+/).length <= 4);
  if (shortLine) {
    return { description: shortLine, confidence: 'medium' };
  }

  // Use first candidate
  return { description: candidates[0], confidence: 'low' };
};

// Extract date from receipt
export const extractDate = (text: string): { date: string | null; confidence: 'high' | 'medium' | 'low' | 'none' } => {
  const lines = text.split('\n');
  const currentYear = new Date().getFullYear();
  
  // Date patterns with priority
  const datePatterns = [
    // ISO format: 2024-01-15
    { pattern: /(\d{4})-(\d{2})-(\d{2})/g, priority: 10, format: (m: RegExpMatchArray) => `${m[1]}-${m[2]}-${m[3]}` },
    // US format: 01/15/2024 or 01-15-2024
    { pattern: /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/g, priority: 9, format: (m: RegExpMatchArray) => `${m[3]}-${m[1]}-${m[2]}` },
    // EU format: 15/01/2024 or 15-01-2024
    { pattern: /(\d{2})[\/\-](\d{2})[\/\-](\d{4})/g, priority: 8, format: (m: RegExpMatchArray) => `${m[3]}-${m[2]}-${m[1]}` },
    // Chinese format: 2024年1月15日
    { pattern: /(\d{4})年(\d{1,2})月(\d{1,2})日/g, priority: 10, format: (m: RegExpMatchArray) => `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` },
    // ROC calendar: 113/01/15 (民國年)
    { pattern: /(\d{2,3})[\/\-](\d{2})[\/\-](\d{2})/g, priority: 7, format: (m: RegExpMatchArray) => {
      const rocYear = parseInt(m[1]);
      const westernYear = rocYear > 1911 ? rocYear : rocYear + 1911;
      return `${westernYear}-${m[2]}-${m[3]}`;
    }},
    // Short format: 01/15/24
    { pattern: /(\d{2})[\/\-](\d{2})[\/\-](\d{2})/g, priority: 6, format: (m: RegExpMatchArray) => {
      const year = parseInt(m[3]);
      const fullYear = year > 50 ? 1900 + year : 2000 + year;
      return `${fullYear}-${m[1]}-${m[2]}`;
    }}
  ];

  const dates: Array<{ date: string; priority: number; line: string }> = [];

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    // Bonus priority if line contains date keywords
    const hasDateKeyword = lowerLine.includes('date') || lowerLine.includes('日期') || lowerLine.includes('time');
    const keywordBonus = hasDateKeyword ? 5 : 0;

    datePatterns.forEach(({ pattern, priority, format }) => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        try {
          const dateStr = format(match);
          const parsedDate = new Date(dateStr);
          
          // Validate date is reasonable (not in far future or past)
          if (!isNaN(parsedDate.getTime())) {
            const year = parsedDate.getFullYear();
            if (year >= 2000 && year <= currentYear + 1) {
              dates.push({
                date: dateStr,
                priority: priority + keywordBonus,
                line: line.trim()
              });
            }
          }
        } catch (e) {
          // Invalid date, skip
        }
      }
    });
  });

  if (dates.length === 0) {
    return { date: null, confidence: 'none' };
  }

  // Sort by priority
  dates.sort((a, b) => b.priority - a.priority);

  const selectedDate = dates[0].date;
  const confidence = dates[0].priority >= 15 ? 'high' : (dates[0].priority >= 10 ? 'medium' : 'low');

  return { date: selectedDate, confidence };
};

// Main function to parse receipt and extract all information
export const parseReceipt = (ocrText: string): ParsedReceipt => {
  if (!ocrText || ocrText.trim().length === 0) {
    return {
      amount: null,
      category: null,
      description: null,
      date: null,
      rawText: ocrText,
      confidence: {
        amount: 'none',
        category: 'none',
        description: 'none',
        date: 'none'
      }
    };
  }

  const amountResult = extractAmountFromText(ocrText);
  const categoryResult = classifyCategory(ocrText);
  const descriptionResult = extractDescription(ocrText);
  const dateResult = extractDate(ocrText);

  return {
    amount: amountResult.amount,
    category: categoryResult.category === 'other' && categoryResult.confidence === 'none' ? null : categoryResult.category,
    description: descriptionResult.description,
    date: dateResult.date,
    rawText: ocrText,
    confidence: {
      amount: amountResult.confidence,
      category: categoryResult.confidence,
      description: descriptionResult.confidence,
      date: dateResult.confidence
    }
  };
};
