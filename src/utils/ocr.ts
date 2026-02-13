import { createWorker } from 'tesseract.js';

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

export const extractAmountFromText = (text: string): number | null => {
  // Look for common currency patterns
  const patterns = [
    /\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/,  // $1,234.56
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|usd)/,  // 1234.56 USD
    /total[:\s]*\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,  // Total: $1234.56
    /amount[:\s]*\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,  // Amount: 1234.56
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  return null;
};
