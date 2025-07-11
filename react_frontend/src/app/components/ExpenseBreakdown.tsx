import React from 'react';
import { ItineraryItem } from '../services/api';

interface ExpenseBreakdownProps {
  itinerary: ItineraryItem[];
}

export const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({ itinerary }) => {
  if (!itinerary || itinerary.length === 0) return null;

  // Group by day, then by category
  const days = Array.from(new Set(itinerary.map(item => item.day))).sort((a, b) => a - b);
  const groupedByDay: { [day: number]: { [category: string]: ItineraryItem[] } } = {};
  itinerary.forEach(item => {
    if (!groupedByDay[item.day]) groupedByDay[item.day] = {};
    if (!groupedByDay[item.day][item.type]) groupedByDay[item.day][item.type] = [];
    groupedByDay[item.day][item.type].push(item);
  });

  const totalCost = itinerary.reduce((sum, item) => sum + (item.cost || 0), 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h3 className="text-lg font-bold mb-4">Expense Breakdown</h3>
      <div className="mb-2">Total Trip Cost: <span className="font-semibold">${totalCost.toFixed(2)}</span></div>
      {days.map(day => {
        const categories = groupedByDay[day] || {};
        const dayTotal = Object.values(categories).flat().reduce((sum, item) => sum + (item.cost || 0), 0);
        return (
          <div key={day} className="mb-6">
            <h4 className="text-md font-semibold mb-2">Day {day} <span className="text-gray-500 font-normal">(Total: ${dayTotal.toFixed(2)})</span></h4>
            {Object.entries(categories).map(([category, items]) => {
              const categoryTotal = items.reduce((sum, item) => sum + (item.cost || 0), 0);
              return (
                <div key={category} className="mb-2 ml-4">
                  <div className="font-medium text-blue-700">{category.charAt(0).toUpperCase() + category.slice(1)} <span className="text-gray-500 font-normal">(${categoryTotal.toFixed(2)})</span></div>
                  <ul className="ml-4 list-disc">
                    {items.map(item => (
                      <li key={item.id} className="text-gray-700">
                        <span className="font-semibold">{item.title}</span> - {item.description} <span className="text-gray-500">({item.time})</span> <span className="text-green-700 font-semibold">${item.cost?.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}; 