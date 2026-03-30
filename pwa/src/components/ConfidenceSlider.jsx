import { useState, useEffect } from 'react';

const LEVELS = [
  { value: 1, label: 'Again', color: '#f44' },
  { value: 2, label: 'Hard', color: '#f90' },
  { value: 3, label: 'Good', color: '#0c6' },
  { value: 4, label: 'Easy', color: '#0af' },
];

export default function ConfidenceSlider({ value, onChange }) {
  return (
    <div className="confidence-slider">
      <div className="confidence-track">
        {LEVELS.map(level => (
          <button
            key={level.value}
            className={`confidence-btn ${value === level.value ? 'active' : ''}`}
            style={value === level.value ? { borderColor: level.color, color: level.color } : {}}
            onClick={() => onChange(level.value)}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}
