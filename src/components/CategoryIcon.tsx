import React from 'react';
import { ExpenseCategory } from '../types';
import { getCategoryEmoji, getCategoryColor } from '../utils/categories';

interface CategoryIconProps {
  category: ExpenseCategory;
  size?: 'sm' | 'md' | 'lg';
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ category, size = 'md' }) => {
  const emoji = getCategoryEmoji(category);
  const color = getCategoryColor(category);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span>{emoji}</span>
    </div>
  );
};

export default CategoryIcon;
