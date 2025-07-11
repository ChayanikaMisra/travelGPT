"use client";
import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { TripPlanner } from './components/TripPlanner';
import { Itinerary } from './components/Itinerary';
import { FlightSearch } from './components/FlightSearch';
import { TripOverview } from './components/TripOverview';
import { ArrowLeft } from 'lucide-react';
import './globals.css';
import { ExpenseBreakdown } from './components/ExpenseBreakdown';

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  travelers: number;
  preferences: string[];
  itinerary?: any[];
  flights?: any[];
  expenses?: any[];
}

function App() {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<'planner' | 'itinerary' | 'flights' | 'expenses' | 'overview'>('planner');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleTripCreate = (trip: Trip) => {
    // Show auth modal after trip creation
    setShowAuthModal(true);
    // Store trip temporarily
    sessionStorage.setItem('pendingTrip', JSON.stringify(trip));
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Retrieve and set the pending trip
    const pendingTrip = sessionStorage.getItem('pendingTrip');
    if (pendingTrip) {
      const trip = JSON.parse(pendingTrip);
      setCurrentTrip(trip);
      setActiveTab('itinerary');
      sessionStorage.removeItem('pendingTrip');
    }
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
    // Check if user is authenticated after modal closes
    const token = localStorage.getItem('access_token');
    if (token) {
      handleAuthSuccess();
    }
  };

  const handleTripUpdate = (updates: Partial<Trip>) => {
    if (currentTrip) {
      setCurrentTrip({ ...currentTrip, ...updates });
    }
  };

  const handleBackToPlanner = () => {
    setCurrentTrip(null);
    setActiveTab('planner');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Header currentTrip={currentTrip} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!currentTrip ? (
            <TripPlanner onTripCreate={handleTripCreate} />
          ) : (
            <div className="space-y-6">
              {/* Back Button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToPlanner}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="font-medium">Back to Trip Planner</span>
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
                {[
                  { id: 'overview', label: 'Trip Overview', icon: '📋' },
                  { id: 'itinerary', label: 'Itinerary', icon: '🗓️' },
                  { id: 'flights', label: 'Flights', icon: '✈️' },
                  { id: 'expenses', label: 'Expenses', icon: '💰' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                {activeTab === 'overview' && (
                  <TripOverview trip={currentTrip} onUpdate={handleTripUpdate} />
                )}
                {activeTab === 'itinerary' && (
                  <Itinerary trip={currentTrip} onUpdate={handleTripUpdate} />
                )}
                {activeTab === 'flights' && (
                  <FlightSearch trip={currentTrip} onUpdate={handleTripUpdate} />
                )}
                {activeTab === 'expenses' && (
                  (() => {
                    const itineraryExpenses = currentTrip?.itinerary || [];
                    const flightExpenses = (currentTrip?.flights || []).map(flight => ({
                      id: flight.id,
                      day: flight.day || 0,
                      title: `Flight: ${flight.airline || ''} ${flight.flightNumber || ''}`,
                      cost: flight.price || 0,
                    }));
                    const customExpenses = currentTrip?.expenses || [];
                    const allExpenses = [...itineraryExpenses, ...flightExpenses, ...customExpenses];
                    return <ExpenseBreakdown itinerary={allExpenses} />;
                  })()
                )}
              </div>
            </div>
          )}
        </main>

        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={handleAuthClose}
        />
      </div>
    </AuthProvider>
  );
}

export default App;