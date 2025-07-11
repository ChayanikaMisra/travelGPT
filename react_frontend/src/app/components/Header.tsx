import React from 'react';
import { MapPin, Calendar, Users, DollarSign, CreditCard } from 'lucide-react';
import { Trip } from '../page';

interface HeaderProps {
  currentTrip: Trip | null;
}

export const Header: React.FC<HeaderProps> = ({ currentTrip }) => {
  const getCurrencySymbol = (currencyCode: string) => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$', 'AUD': 'A$',
      'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'KRW': '₩', 'SGD': 'S$', 'HKD': 'HK$',
      'NOK': 'kr', 'SEK': 'kr', 'DKK': 'kr', 'PLN': 'zł', 'CZK': 'Kč', 'HUF': 'Ft',
      'RUB': '₽', 'BRL': 'R$', 'MXN': '$', 'ZAR': 'R', 'TRY': '₺', 'AED': 'د.إ', 'SAR': '﷼'
    };
    return currencySymbols[currencyCode] || currencyCode;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">TravelGPT</h1>
            </div>
            
            {currentTrip && (
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{currentTrip.destination}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(currentTrip.startDate).toLocaleDateString()} - {new Date(currentTrip.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{currentTrip.travelers} traveler{currentTrip.travelers > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{getCurrencySymbol(currentTrip.currency)}{(currentTrip.budget || 0).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Save Trip
            </button>
            {currentTrip && (
              <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Pay & Book</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};