import React from 'react';
import { EnvironmentalMetric } from '../../utils/types';
import { getStatusColor, getStatusTextColor, getStatusBgColor } from '../../utils/helpers';
import { getMetricIcon } from '../../utils/mockData';

interface EnvironmentalCardProps {
  metric: EnvironmentalMetric;
}

const EnvironmentalCard: React.FC<EnvironmentalCardProps> = ({ metric }) => {
  const Icon = getMetricIcon(metric.icon);
  const statusColor = getStatusColor(metric.status);
  const statusTextColor = getStatusTextColor(metric.status);
  const statusBgColor = getStatusBgColor(metric.status);

  // Calculate percentage for the progress bar
  const percentage = Math.min(
    Math.max(
      ((metric.value - metric.minValue) / (metric.maxValue - metric.minValue)) * 100,
      0
    ),
    100
  );

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div className="flex items-center mb-3">
          <div className={`${statusBgColor} p-2 rounded-lg mr-3`}>
            <Icon className={`${statusTextColor}`} size={20} />
          </div>
          <h3 className="text-lg font-medium text-gray-800">{metric.name}</h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusBgColor} ${statusTextColor}`}>
          {metric.status}
        </div>
      </div>
      
      <div className="mt-2">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-2xl font-bold text-gray-900">
            {typeof metric.value === 'boolean' 
              ? (metric.value ? 'Smoke Detected' : 'No Smoke Detected')
              : `${metric.value} ${metric.unit}`
            }
          </span>
          {typeof metric.value === 'number' && (
            <span className="text-xs text-gray-500">
              {metric.minValue} - {metric.maxValue} {metric.unit}
            </span>
          )}
        </div>
        
        {typeof metric.value === 'number' && (
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-2 text-xs flex rounded-full bg-gray-200">
              <div 
                style={{ width: `${percentage}%` }} 
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${statusColor} transition-all duration-500 ease-in-out`}
              />
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-2">
          Last updated: {new Date(metric.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalCard;