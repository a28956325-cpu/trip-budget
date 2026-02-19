import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { ExpenseCategory, ParsedReceipt } from '../types';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Constants for text extraction thresholds
export const MIN_PDF_TEXT_LENGTH = 50; // Minimum characters to consider PDF has extractable text
const MIN_HOTEL_NAME_LENGTH = 5;
const MAX_HOTEL_NAME_LENGTH = 100;
const MAX_GARBAGE_RATIO = 0.3; // Maximum ratio of garbage characters allowed

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

// Extract text directly from PDF (no OCR needed)
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF text extraction error:', error);
    return '';
  }
};

// Render PDF to canvas and perform OCR (fallback for scanned PDFs)
export const extractTextFromPDFWithOCR = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      const imageData = canvas.toDataURL('image/png');
      const ocrText = await performOCR(imageData);
      fullText += ocrText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF OCR error:', error);
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
    'net', 'total', 'amount', 'sum',
    'final price', 'price', 'you\'ll pay', 'youll pay'
  ];

  // Enhanced currency patterns
  const currencyPatterns = [
    /[$＄]\s*(\d{1,3}(?:[,，]\d{3})*(?:[.,．]\d{2})?)/gi,  // $1,234.56 or ＄1,234.56
    /US\$\s*(\d{1,3}(?:[,，]\d{3})*(?:[.,．]\d{2})?)/gi,  // US$1,234.56
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
      'booking confirmation', 'nights', 'property', 'residence', 'stay',
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

  // For hotel bookings, look for hotel names with special patterns
  const hotelPatterns = [
    /(?:Residence Inn|Marriott|Hilton|Hyatt|Holiday Inn|Best Western|Hampton Inn|Sheraton|Westin|Radisson|Courtyard|Fairfield Inn|SpringHill Suites|TownePlace Suites|Embassy Suites|DoubleTree|Homewood Suites|Home2 Suites|Four Points|Aloft|Element|Le Méridien|Luxury Collection|Tribute Portfolio|Design Hotels|W Hotels|St\. Regis|EDITION|Ritz-Carlton|JW Marriott|Renaissance|AC Hotels|Moxy|Autograph Collection|Delta Hotels|Gaylord Hotels)[^\n]*/gi,
    /(?:Hotel|Inn|Resort|Suites?|Lodge)\s+[A-Z][^\n]*/gi
  ];

  for (const pattern of hotelPatterns) {
    const match = text.match(pattern);
    if (match && match[0].length > MIN_HOTEL_NAME_LENGTH && match[0].length < MAX_HOTEL_NAME_LENGTH) {
      return { description: match[0].trim(), confidence: 'high' };
    }
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
    /^from[:\s]/i,
    /^to[:\s]/i,
    /^time[:\s]/i,
    /^date[:\s]/i,
    /total[:\s]/i,  // Skip lines with "total"
    /subtotal/i,
    /amount/i,
    /payment/i,
    /電話/,
    /地址/,
    /^[\d\s\-()]+$/,  // Just phone numbers
    /^\d{2,4}[-/]\d{2}[-/]\d{2}/,  // Dates
    /^\d{1,2}:\d{2}/,  // Times
    /[$€£¥￥＄]\s*\d/,  // Lines with prices
    /booking\.com/i,  // Skip Booking.com header
    /confirmation/i  // Skip confirmation header lines
  ];

  // Look at first 15 lines for merchant name (expanded from 10)
  const candidates = lines.slice(0, 15).filter(line => {
    // Skip if matches exclude patterns
    if (excludePatterns.some(pattern => pattern.test(line))) {
      return false;
    }
    // Skip lines containing dates or times
    if (/\d{4}[-/]\d{2}[-/]\d{2}/.test(line) || 
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line) ||
        /\d{1,2}:\d{2}/.test(line)) {
      return false;
    }
    // Skip very short lines (< 3 chars) but allow longer ones (up to 80 chars for hotel names)
    if (line.length < 3 || line.length > 80) {
      return false;
    }
    // Skip lines that are mostly garbage characters
    const garbageChars = /[^\w\s\-.'&,()]/g;
    const garbageCount = (line.match(garbageChars) || []).length;
    if (garbageCount > line.length * MAX_GARBAGE_RATIO) {
      return false;
    }
    return true;
  });

  if (candidates.length === 0) {
    return { description: lines[0].substring(0, 50), confidence: 'low' };
  }

  // Prefer lines in ALL CAPS that don't contain "RECEIPT" or "INVOICE" (typical for brand names)
  const brandLine = candidates.find(line => {
    const upper = line.toUpperCase();
    return line === upper && 
           line.length > 3 && 
           !upper.includes('RECEIPT') && 
           !upper.includes('INVOICE');
  });
  if (brandLine) {
    return { description: brandLine, confidence: 'high' };
  }

  // For hotel bookings, prefer longer descriptive lines (hotel names are often detailed)
  const longLine = candidates.find(line => {
    const words = line.split(/\s+/);
    return words.length >= 3 && words.length <= 10 && line.length >= 10;
  });
  if (longLine) {
    return { description: longLine, confidence: 'medium' };
  }

  // Prefer shorter lines (1-4 words) that don't contain receipt/invoice
  const shortLine = candidates.find(line => {
    const words = line.split(/\s+/);
    const lower = line.toLowerCase();
    return words.length <= 4 && 
           !lower.includes('receipt') && 
           !lower.includes('invoice');
  });
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
    // Day Month format: 29 APRIL, 2 MAY (common in booking confirmations)
    { pattern: /(\d{1,2})\s+(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)/gi, priority: 11, format: (m: RegExpMatchArray) => {
      const monthMap: Record<string, string> = {
        'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05', 'june': '06',
        'july': '07', 'august': '08', 'september': '09', 'october': '10', 'november': '11', 'december': '12'
      };
      const month = monthMap[m[2].toLowerCase()];
      const day = m[1].padStart(2, '0');
      return `${currentYear}-${month}-${day}`;
    }},
    // Month name format: Jan 22, 2024 or January 22, 2024
    { pattern: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/gi, priority: 10, format: (m: RegExpMatchArray) => {
      const monthMap: Record<string, string> = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
      };
      const month = monthMap[m[1].toLowerCase().substring(0, 3)];
      const day = m[2].padStart(2, '0');
      return `${m[3]}-${month}-${day}`;
    }},
    // US format: 01/15/2024 or 01-15-2024
    { pattern: /(\d{2})[/-](\d{2})[/-](\d{4})/g, priority: 9, format: (m: RegExpMatchArray) => `${m[3]}-${m[1]}-${m[2]}` },
    // EU format: 15/01/2024 or 15-01-2024
    { pattern: /(\d{2})[/-](\d{2})[/-](\d{4})/g, priority: 8, format: (m: RegExpMatchArray) => `${m[3]}-${m[2]}-${m[1]}` },
    // Chinese format: 2024年1月15日
    { pattern: /(\d{4})年(\d{1,2})月(\d{1,2})日/g, priority: 10, format: (m: RegExpMatchArray) => `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` },
    // ROC calendar: 113/01/15 (民國年)
    { pattern: /(\d{2,3})[/-](\d{2})[/-](\d{2})/g, priority: 7, format: (m: RegExpMatchArray) => {
      const rocYear = parseInt(m[1]);
      const westernYear = rocYear > 1911 ? rocYear : rocYear + 1911;
      return `${westernYear}-${m[2]}-${m[3]}`;
    }},
    // Short format: 01/15/24
    { pattern: /(\d{2})[/-](\d{2})[/-](\d{2})/g, priority: 6, format: (m: RegExpMatchArray) => {
      const year = parseInt(m[3]);
      const fullYear = year > 50 ? 1900 + year : 2000 + year;
      return `${fullYear}-${m[1]}-${m[2]}`;
    }}
  ];

  const dates: Array<{ date: string; priority: number; line: string }> = [];

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    // Higher priority for CHECK-IN dates (common in hotel bookings)
    const hasCheckInKeyword = lowerLine.includes('check-in') || lowerLine.includes('check in') || lowerLine.includes('checkin');
    const checkInBonus = hasCheckInKeyword ? 10 : 0;
    
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
                priority: priority + keywordBonus + checkInBonus,
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
  const confidence = dates[0].priority >= 20 ? 'high' : (dates[0].priority >= 10 ? 'medium' : 'low');

  return { date: selectedDate, confidence };
};

// Main function to parse receipt and extract all information
export const parseReceipt = (ocrText: string, extractionMethod: 'pdf-text' | 'ocr' = 'ocr'): ParsedReceipt => {
  if (!ocrText || ocrText.trim().length === 0) {
    return {
      amount: null,
      category: null,
      description: null,
      date: null,
      rawText: ocrText,
      extractionMethod,
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

  // Boost confidence for PDF text extraction (it's 100% accurate text)
  const boostConfidence = (conf: 'high' | 'medium' | 'low' | 'none'): 'high' | 'medium' | 'low' | 'none' => {
    if (extractionMethod === 'pdf-text' && conf !== 'none') {
      return conf === 'low' ? 'medium' : 'high';
    }
    return conf;
  };

  return {
    amount: amountResult.amount,
    category: categoryResult.category === 'other' && categoryResult.confidence === 'none' ? null : categoryResult.category,
    description: descriptionResult.description,
    date: dateResult.date,
    rawText: ocrText,
    extractionMethod,
    confidence: {
      amount: boostConfidence(amountResult.confidence),
      category: boostConfidence(categoryResult.confidence),
      description: boostConfidence(descriptionResult.confidence),
      date: boostConfidence(dateResult.confidence)
    }
  };
};
