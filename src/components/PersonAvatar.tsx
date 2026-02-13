import React from 'react';
import { Person } from '../types';

interface PersonAvatarProps {
  person: Person;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const PersonAvatar: React.FC<PersonAvatarProps> = ({ person, size = 'md', showName = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const initials = person.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white`}
        style={{ backgroundColor: person.color }}
      >
        {initials}
      </div>
      {showName && <span className="text-sm font-medium text-gray-700">{person.name}</span>}
    </div>
  );
};

export default PersonAvatar;
