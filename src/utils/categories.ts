import { ExpenseCategory, CategoryInfo } from '../types';

export const categories: CategoryInfo[] = [
  { id: 'food', name: '🍽️ 食 Food', emoji: '🍽️', color: '#ef4444' },
  { id: 'clothing', name: '👕 衣 Clothing', emoji: '👕', color: '#8b5cf6' },
  { id: 'accommodation', name: '🏨 住 Accommodation', emoji: '🏨', color: '#3b82f6' },
  { id: 'transport', name: '🚗 行 Transport', emoji: '🚗', color: '#10b981' },
  { id: 'education', name: '📚 育 Education', emoji: '📚', color: '#f59e0b' },
  { id: 'entertainment', name: '🎮 樂 Entertainment', emoji: '🎮', color: '#ec4899' },
  { id: 'other', name: '📦 其他 Other', emoji: '📦', color: '#6b7280' },
];

export const getCategoryInfo = (category: ExpenseCategory): CategoryInfo => {
  return categories.find(c => c.id === category) || categories[categories.length - 1];
};

export const getCategoryColor = (category: ExpenseCategory): string => {
  return getCategoryInfo(category).color;
};

export const getCategoryEmoji = (category: ExpenseCategory): string => {
  return getCategoryInfo(category).emoji;
};

export const getCategoryName = (category: ExpenseCategory): string => {
  return getCategoryInfo(category).name;
};
