import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, RefreshCw, CheckCircle } from 'lucide-react';
import { Trip } from '../page';
import { itineraryAPI, ItineraryItem } from '../services/api';

interface ItineraryProps {
  trip: Trip;
  onUpdate: (updates: Partial<Trip>) => void;
}

export const Itinerary: React.FC<ItineraryProps> = ({ trip, onUpdate }) => {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);

  useEffect(() => {
    generateItinerary();
  }, []);

  const generateItinerary = async () => {
    setIsGenerating(true);
    
    try {
      const itineraryItems = await itineraryAPI.generateItinerary({
        destination: trip.destination,
        start_date: trip.startDate,
        end_date: trip.endDate,
        budget: trip.budget,
        currency: trip.currency,
        travelers: trip.travelers,
        preferences: trip.preferences
      });
      
      setItinerary(itineraryItems);
      onUpdate({ itinerary: itineraryItems });
    } catch (error) {
      console.error('Error generating itinerary:', error);
      // Fallback to empty itinerary if API fails
      setItinerary([]);
      onUpdate({ itinerary: [] });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCompleted = (id: string) => {
    setItinerary(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'activity': return '🎯';
      case 'restaurant': return '🍽️';
      case 'attraction': return '🏛️';
      case 'transportation': return '🚗';
      default: return '📍';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'activity': return 'bg-blue-100 text-blue-800';
      case 'restaurant': return 'bg-green-100 text-green-800';
      case 'attraction': return 'bg-purple-100 text-purple-800';
      case 'transportation': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get unique days from the itinerary, sorted
  const days = Array.from(new Set(itinerary.map(item => item.day))).sort((a, b) => a - b);
  // Fallback to [1, 2, 3] if itinerary is empty
  const dayTabs = days.length > 0 ? days : [1, 2, 3];
  
  // Sort itinerary items by time for the selected day
  const sortByTime = (items: ItineraryItem[]) => {
    return items.sort((a, b) => {
      const timeA = parseTime(a.time);
      const timeB = parseTime(b.time);
      return timeA - timeB;
    });
  };

  const parseTime = (timeStr: string): number => {
    // Handle various time formats: "9:00 AM", "14:30", "2:30 PM", etc.
    const time = timeStr.toLowerCase().trim();
    
    // Remove any extra text like "morning", "afternoon", etc.
    const cleanTime = time.replace(/\s+(morning|afternoon|evening|night)/, '');
    
    // Handle 12-hour format with AM/PM
    if (cleanTime.includes('am') || cleanTime.includes('pm')) {
      const [timePart, period] = cleanTime.split(/(am|pm)/);
      const [hours, minutes] = timePart.split(':').map(Number);
      let hour24 = hours;
      
      if (period === 'pm' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === 'am' && hours === 12) {
        hour24 = 0;
      }
      
      return hour24 * 60 + (minutes || 0);
    }
    
    // Handle 24-hour format
    const [hours, minutes] = cleanTime.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  };

  const filteredItinerary = sortByTime(itinerary.filter(item => item.day === selectedDay));

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Creating Your Perfect Itinerary</h3>
        <p className="text-gray-600 text-center max-w-md">
          Our AI is analyzing your preferences and creating a personalized day-by-day itinerary for {trip.destination}...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Itinerary</h2>
        <button
          onClick={generateItinerary}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate
        </button>
      </div>

      {/* Day Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {dayTabs.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedDay === day
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day {day}
          </button>
        ))}
      </div>

      {/* Itinerary Items */}
      <div className="space-y-4">
        {filteredItinerary.map(item => (
          <div
            key={item.id}
            className={`bg-white border rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${
              item.completed ? 'opacity-75 border-green-200' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">{item.time}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)} {item.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{item.rating}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-3">{item.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location}</span>
                  </div>
                  <span>Duration: {item.duration}</span>
                  <span>Cost: ${item.cost}</span>
                </div>
              </div>
              
              <button
                onClick={() => toggleCompleted(item.id)}
                className={`ml-4 p-2 rounded-full transition-all duration-200 ${
                  item.completed
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItinerary.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No activities planned for Day {selectedDay} yet.</p>
        </div>
      )}
    </div>
  );
};