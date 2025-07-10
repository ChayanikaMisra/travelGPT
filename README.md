# Travel Planner Application

A full-stack travel planning application with AI-powered itinerary generation.

## Project Structure

```
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/           # Python FastAPI backend
│   ├── app/
│   ├── requirements.txt
│   └── ...
└── README.md
```

## Getting Started

### Frontend (React + TypeScript)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Backend (Python FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```bash
   python run.py
   ```

The backend API will be available at `https://localhost:8000`

## Features

- **Frontend**: Modern React application with TypeScript, Tailwind CSS, and responsive design
- **Backend**: FastAPI with MongoDB integration, JWT authentication, and HTTPS support
- **AI Integration**: Personalized trip planning and itinerary generation
- **User Management**: Secure authentication and user profiles
- **Trip Management**: Create, update, and track travel plans
- **Expense Tracking**: Monitor spending and budget management
- **Flight Search**: Find and book flights for your trips

## Development

Both frontend and backend support hot reloading during development. Make sure to run both servers simultaneously for full functionality.