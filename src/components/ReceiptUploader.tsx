import React, { useState, useRef } from 'react';
import { fileToBase64 } from '../utils/helpers';
import { performOCR, extractAmountFromText } from '../utils/ocr';

interface ReceiptUploaderProps {
  onReceiptUpload: (receiptUrl: string, receiptType: 'image' | 'pdf', ocrText?: string, detectedAmount?: number) => void;
  currentReceipt?: string;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onReceiptUpload, currentReceipt }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentReceipt || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const isImage = fileType.startsWith('image/');
    const isPDF = fileType === 'application/pdf';

    if (!isImage && !isPDF) {
      alert('Please upload an image (JPG, PNG) or PDF file');
      return;
    }

    setIsProcessing(true);

    try {
      const base64 = await fileToBase64(file);
      setPreview(base64);

      if (isImage) {
        // Perform OCR on images
        const ocrText = await performOCR(base64);
        const detectedAmount = extractAmountFromText(ocrText);
        onReceiptUpload(base64, 'image', ocrText, detectedAmount || undefined);
      } else {
        // For PDFs, just store the file
        onReceiptUpload(base64, 'pdf');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeReceipt = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Receipt (Optional)
      </label>

      {preview ? (
        <div className="relative">
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            {preview.startsWith('data:application/pdf') ? (
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">📄</div>
                  <p className="text-sm text-gray-600">PDF Receipt Attached</p>
                </div>
              </div>
            ) : (
              <img src={preview} alt="Receipt" className="w-full h-48 object-cover" />
            )}
          </div>
          <button
            type="button"
            onClick={removeReceipt}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-4xl mb-2">📸</div>
          <p className="text-sm text-gray-600 mb-1">
            Drop receipt here or click to upload
          </p>
          <p className="text-xs text-gray-500">
            Supports JPG, PNG, PDF
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {isProcessing && (
        <div className="flex items-center justify-center space-x-2 text-primary-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div>
          <span className="text-sm">Processing receipt...</span>
        </div>
      )}
    </div>
  );
};

export default ReceiptUploader;
