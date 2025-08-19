import { useState } from 'react';
import { User, Check } from 'lucide-react';

const VoteCard = ({ candidate, isSelected, onSelect, disabled }) => {
  return (
    <div
      className={`card cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-primary-500 bg-primary-50'
          : 'hover:shadow-xl hover:scale-105'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onSelect(candidate.id)}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-500" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{candidate.name}</h3>
          <p className="text-gray-600">{candidate.position}</p>
          {candidate.description && (
            <p className="text-sm text-gray-500 mt-1">{candidate.description}</p>
          )}
        </div>

        <div className="flex-shrink-0">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              isSelected
                ? 'bg-primary-500 border-primary-500'
                : 'border-gray-300'
            }`}
          >
            {isSelected && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoteCard;