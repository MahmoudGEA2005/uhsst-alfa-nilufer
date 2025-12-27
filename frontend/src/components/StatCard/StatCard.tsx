import React from 'react';
import './StatCard.css';

interface StatCardProps {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string | number;
  subValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, subValue }) => {
  const subValueClass = subValue?.startsWith('/') ? 'stat-total' : 'stat-pm';
  
  return (
    <div className='stat-card'>
      <div className='stat-header'>
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <div className='stat-value'>
        {value}
        {subValue && <span className={subValueClass}>{subValue}</span>}
      </div>
    </div>
  );
};

export default StatCard;
