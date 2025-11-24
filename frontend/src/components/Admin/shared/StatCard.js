import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

const StatCard = ({ title, value, change, icon, color = 'primary' }) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card-header">
        <div className="stat-card-icon-wrapper">
          {icon}
        </div>
        {change !== undefined && (
          <div className={`stat-card-trend ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`}>
            {isPositive && <TrendingUp size={16} />}
            {isNegative && <TrendingDown size={16} />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-title">{title}</div>
      </div>
    </div>
  );
};

export default StatCard;