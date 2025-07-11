import React from 'react';
import { MapPin, Calendar, Users, DollarSign, Clock, Plane, Star } from 'lucide-react';
import { Trip } from '../page';

interface TripOverviewProps {
  trip: Trip;
  onUpdate: (updates: Partial<Trip>) => void;
}

export const TripOverview: React.FC<TripOverviewProps> = ({ trip }) => {
  const getCurrencySymbol = (currencyCode: string) => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$', 'AUD': 'A$',
      'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'KRW': '₩', 'SGD': 'S$', 'HKD': 'HK$',
      'NOK': 'kr', 'SEK': 'kr', 'DKK': 'kr', 'PLN': 'zł', 'CZK': 'Kč', 'HUF': 'Ft',
      'RUB': '₽', 'BRL': 'R$', 'MXN': '$', 'ZAR': 'R', 'TRY': '₺', 'AED': 'د.إ', 'SAR': '﷼'
    };
    return currencySymbols[currencyCode] || currencyCode;
  };

  const totalExpenses = trip.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const remainingBudget = trip.budget - totalExpenses;
  const tripDuration = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const completedActivities = trip.itinerary?.filter(item => item.completed).length || 0;
  const totalActivities = trip.itinerary?.length || 0;
  const completionPercentage = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Trip to {trip.destination}</h2>
        <p className="text-lg text-gray-600">Your personalized travel overview</p>
      </div>

      {/* Trip Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Duration</h3>
          </div>
          <p className="text-2xl font-bold text-blue-900">{tripDuration} days</p>
          <p className="text-sm text-blue-700">
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Travelers</h3>
          </div>
          <p className="text-2xl font-bold text-green-900">{trip.travelers}</p>
          <p className="text-sm text-green-700">
            {trip.travelers === 1 ? 'Solo trip' : 'Group adventure'}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Budget</h3>
          </div>
          <p className="text-2xl font-bold text-purple-900">{getCurrencySymbol(trip.currency)}{trip.budget.toLocaleString()}</p>
          <p className="text-sm text-purple-700">
            {getCurrencySymbol(trip.currency)}{remainingBudget.toLocaleString()} remaining
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Progress</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-900">{completionPercentage.toFixed(0)}%</p>
          <p className="text-sm text-yellow-700">
            {completedActivities} of {totalActivities} activities done
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Trip Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Activities Completed</span>
              <span className="text-sm text-gray-600">{completedActivities}/{totalActivities}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Budget Used</span>
              <span className="text-sm text-gray-600">${totalExpenses.toLocaleString()}/${trip.budget.toLocaleString()}</span>
              <span className="text-sm text-gray-600">{getCurrencySymbol(trip.currency)}{totalExpenses.toLocaleString()}/{getCurrencySymbol(trip.currency)}{trip.budget.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  (totalExpenses / trip.budget) * 100 > 100 ? 'bg-red-500' : 
                  (totalExpenses / trip.budget) * 100 > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((totalExpenses / trip.budget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Travel Preferences */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Your Travel Preferences</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {trip.preferences.map(preference => (
            <div key={preference} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <span className="text-sm font-medium text-blue-800">{preference}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Today's Itinerary</h4>
            </div>
            <p className="text-sm text-gray-600">View your planned activities for today</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-2">
              <Plane className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-gray-900">Flight Details</h4>
            </div>
            <p className="text-sm text-gray-600">Check your flight information and status</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-gray-900">Add Expense</h4>
            </div>
            <p className="text-sm text-gray-600">Log a new expense from your trip</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {trip.itinerary && trip.itinerary.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Upcoming Activities</h3>
          <div className="space-y-3">
            {trip.itinerary.filter(item => !item.completed).slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600">Day {item.day} at {item.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{item.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};