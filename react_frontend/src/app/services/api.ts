import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('access_token')) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      // Don't reload immediately, let the app handle it
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  is_active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ItineraryRequest {
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  travelers: number;
  preferences: string[];
}

export interface ItineraryItem {
  id: string;
  day: number;
  time: string;
  title: string;
  description: string;
  location: string;
  type: string;
  duration: string;
  cost: number;
  rating: number;
  completed: boolean;
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials)
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error || "Login failed");
    }

    const data = await res.json();
    return data;
  },

  signup: async (userData: SignupData): Promise<User> => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const itineraryAPI = {
  generateItinerary: async (request: ItineraryRequest): Promise<ItineraryItem[]> => {
    const response = await api.post('/itinerary/generate', request);
    return response.data.itinerary;
  },
};

export const tripsAPI = {
  createTrip: async (tripData: any) => {
    const response = await api.post('/trips', tripData);
    return response.data;
  },

  getUserTrips: async () => {
    const response = await api.get('/trips');
    return response.data;
  },

  updateTrip: async (tripId: string, updates: any) => {
    const response = await api.put(`/trips/${tripId}`, updates);
    return response.data;
  },
};

export default api;