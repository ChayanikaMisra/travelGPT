import React, { useState, useEffect } from 'react';
import { Plane, Clock, DollarSign, Users, Filter, TrendingUp, Calendar } from 'lucide-react';
import { Trip } from '../page';

interface FlightSearchProps {
  trip: Trip;
  onUpdate: (updates: Partial<Trip>) => void;
}

interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  stops: number;
  price: number;
  class: 'economy' | 'business' | 'first';
  features: string[];
}

export const FlightSearch: React.FC<FlightSearchProps> = ({ trip, onUpdate }) => {
  const getCurrencySymbol = (currencyCode: string) => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$', 'AUD': 'A$',
      'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'KRW': '₩', 'SGD': 'S$', 'HKD': 'HK$',
      'NOK': 'kr', 'SEK': 'kr', 'DKK': 'kr', 'PLN': 'zł', 'CZK': 'Kč', 'HUF': 'Ft',
      'RUB': '₽', 'BRL': 'R$', 'MXN': '$', 'ZAR': 'R', 'TRY': '₺', 'AED': 'د.إ', 'SAR': '﷼'
    };
    return currencySymbols[currencyCode] || currencyCode;
  };

  const [flights, setFlights] = useState<Flight[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState<'all' | 'cheapest' | 'fastest' | 'best'>('all');
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [searchDates, setSearchDates] = useState({
    departure: trip.startDate || '',
    return: trip.endDate || ''
  });
  const [showDateForm, setShowDateForm] = useState(!trip.startDate || !trip.endDate);

  useEffect(() => {
    if (trip.startDate && trip.endDate) {
      searchFlights();
    }
  }, []);

  const searchFlights = async () => {
    if (!searchDates.departure) {
      alert('Please select a departure date');
      return;
    }
    
    setIsSearching(true);
    setShowDateForm(false);
    
    // Simulate flight search API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockFlights: Flight[] = [
      {
        id: '1',
        airline: 'Air France',
        flightNumber: 'AF 83',
        departure: {
          airport: 'JFK',
          city: 'New York',
          time: '10:25 AM',
          date: searchDates.departure
        },
        arrival: {
          airport: 'CDG',
          city: 'Paris',
          time: '11:50 PM',
          date: searchDates.departure
        },
        duration: '7h 25m',
        stops: 0,
        price: 650,
        class: 'economy',
        features: ['WiFi', 'Entertainment', 'Meal included']
      },
      {
        id: '2',
        airline: 'Delta Airlines',
        flightNumber: 'DL 126',
        departure: {
          airport: 'JFK',
          city: 'New York',
          time: '11:59 PM',
          date: searchDates.departure
        },
        arrival: {
          airport: 'CDG',
          city: 'Paris',
          time: '2:15 PM',
          date: new Date(new Date(searchDates.departure).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        duration: '8h 16m',
        stops: 0,
        price: 589,
        class: 'economy',
        features: ['WiFi', 'Entertainment', 'Meal included', 'Extra legroom']
      },
      {
        id: '3',
        airline: 'United Airlines',
        flightNumber: 'UA 57',
        departure: {
          airport: 'JFK',
          city: 'New York',
          time: '6:00 PM',
          date: searchDates.departure
        },
        arrival: {
          airport: 'CDG',
          city: 'Paris',
          time: '7:05 AM',
          date: new Date(new Date(searchDates.departure).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        duration: '7h 05m',
        stops: 0,
        price: 720,
        class: 'economy',
        features: ['WiFi', 'Entertainment', 'Meal included', 'Priority boarding']
      },
      {
        id: '4',
        airline: 'British Airways',
        flightNumber: 'BA 112',
        departure: {
          airport: 'JFK',
          city: 'New York',
          time: '8:25 PM',
          date: searchDates.departure
        },
        arrival: {
          airport: 'CDG',
          city: 'Paris',
          time: '2:50 PM',
          date: new Date(new Date(searchDates.departure).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        duration: '12h 25m',
        stops: 1,
        price: 485,
        class: 'economy',
        features: ['WiFi', 'Entertainment', 'Meal included']
      }
    ];

    setFlights(mockFlights);
    onUpdate({ flights: mockFlights });
    setIsSearching(false);
  };

  const handleSearchWithDates = () => {
    // Update trip with the selected dates
    onUpdate({ 
      startDate: searchDates.departure,
      endDate: searchDates.return || searchDates.departure
    });
    searchFlights();
  };

  const getFilteredFlights = () => {
    switch (filter) {
      case 'cheapest':
        return [...flights].sort((a, b) => a.price - b.price);
      case 'fastest':
        return [...flights].sort((a, b) => {
          const getDurationMinutes = (duration: string) => {
            const [hours, minutes] = duration.replace(/[hm]/g, '').split(' ').map(Number);
            return hours * 60 + minutes;
          };
          return getDurationMinutes(a.duration) - getDurationMinutes(b.duration);
        });
      case 'best':
        return [...flights].sort((a, b) => {
          const scoreA = (1000 - a.price) + (a.stops === 0 ? 100 : 0);
          const scoreB = (1000 - b.price) + (b.stops === 0 ? 100 : 0);
          return scoreB - scoreA;
        });
      default:
        return flights;
    }
  };

  const handleFlightSelect = (flightId: string) => {
    setSelectedFlight(flightId);
    const flight = flights.find(f => f.id === flightId);
    if (flight) {
      // Add to expenses
      const expense = {
        id: Date.now().toString(),
        description: `Flight: ${flight.airline} ${flight.flightNumber}`,
        amount: flight.price * trip.travelers,
        category: 'Transportation',
        date: new Date().toISOString().split('T')[0]
      };
      
      onUpdate({ 
        expenses: [...(trip.expenses || []), expense]
      });
    }
  };

  // Show date selection form if dates are not available
  if (showDateForm) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Flight Search</h2>
          <p className="text-gray-600">Please select your travel dates to search for flights</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md mx-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Departure Date *
              </label>
              <input
                type="date"
                value={searchDates.departure}
                onChange={(e) => setSearchDates(prev => ({ ...prev, departure: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Return Date (Optional)
              </label>
              <input
                type="date"
                value={searchDates.return}
                onChange={(e) => setSearchDates(prev => ({ ...prev, return: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={handleSearchWithDates}
            disabled={!searchDates.departure}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plane className="w-4 h-4" />
            Search Flights
          </button>
        </div>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Searching for Flights</h3>
        <p className="text-gray-600 text-center max-w-md">
          Finding the best flight options for your trip to {trip.destination}...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Flight Search</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDateForm(true)}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <Calendar className="w-4 h-4" />
            Change Dates
          </button>
          <button
            onClick={searchFlights}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plane className="w-4 h-4" />
            Search Again
          </button>
        </div>
      </div>

      {/* Search Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-4 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4" />
            <span>JFK → CDG</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{new Date(searchDates.departure).toLocaleDateString()}</span>
            {searchDates.return && (
              <>
                <span>→</span>
                <span>{new Date(searchDates.return).toLocaleDateString()}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{trip.travelers} passenger{trip.travelers > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700 mr-2">Sort by:</span>
        {[
          { id: 'all', label: 'All Flights' },
          { id: 'cheapest', label: 'Cheapest' },
          { id: 'fastest', label: 'Fastest' },
          { id: 'best', label: 'Best Value' }
        ].map(option => (
          <button
            key={option.id}
            onClick={() => setFilter(option.id as any)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === option.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Flight Results */}
      <div className="space-y-4">
        {getFilteredFlights().map(flight => (
          <div
            key={flight.id}
            className={`bg-white border rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${
              selectedFlight === flight.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plane className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{flight.airline}</h3>
                  <p className="text-sm text-gray-600">{flight.flightNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{getCurrencySymbol(trip.currency)}{flight.price}</p>
                <p className="text-sm text-gray-600">per person</p>
              </div>
            </div>

            {/* Flight Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Departure</p>
                <p className="font-semibold">{flight.departure.time}</p>
                <p className="text-sm text-gray-600">{flight.departure.airport}, {flight.departure.city}</p>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-600">{flight.duration}</p>
                  <div className="flex items-center justify-center my-2">
                    <div className="w-16 h-px bg-gray-300"></div>
                    <Plane className="w-4 h-4 text-gray-400 mx-2" />
                    <div className="w-16 h-px bg-gray-300"></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Arrival</p>
                <p className="font-semibold">{flight.arrival.time}</p>
                <p className="text-sm text-gray-600">{flight.arrival.airport}, {flight.arrival.city}</p>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-4">
              {flight.features.map(feature => (
                <span
                  key={feature}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Select Button */}
            <button
              onClick={() => handleFlightSelect(flight.id)}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                selectedFlight === flight.id
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {selectedFlight === flight.id ? 'Selected' : 'Select This Flight'}
            </button>
          </div>
        ))}
      </div>

      {/* Price Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">Total Flight Cost</span>
          </div>
          <span className="text-xl font-bold text-gray-900">
            {getCurrencySymbol(trip.currency)}{selectedFlight ? (flights.find(f => f.id === selectedFlight)?.price || 0) * trip.travelers : 0}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          For {trip.travelers} passenger{trip.travelers > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};