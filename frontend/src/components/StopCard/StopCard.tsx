import React from 'react';
import './StopCard.css';

interface StopCardProps {
  number: number;
  address: string;
  info: string;
  badges?: string[];
  isActive?: boolean;
}

const StopCard: React.FC<StopCardProps> = ({ number, address, info, badges, isActive = false }) => {
  return (
    <div className={`stop-item ${isActive ? 'current' : ''}`}>
      <div className='stop-number'>{number}</div>
      <div className='stop-details'>
        <h4 className='stop-address'>{address}</h4>
        <p className='stop-info'>{info}</p>
        {badges && badges.length > 0 && (
          <div className='stop-badges'>
            {badges.map((badge, index) => (
              <span key={index} className='badge'>{badge}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StopCard;
