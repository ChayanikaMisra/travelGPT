# Travel Planner Backend

A FastAPI-based backend for the Travel Planner application with MongoDB integration.

## Features

- User authentication with JWT tokens
- MongoDB database integration
- RESTful API endpoints
- CORS support for frontend integration
- Password hashing with bcrypt
- Trip management for authenticated users

## Setup Instructions

### Prerequisites

- Python 3.8+
- MongoDB (local installation or MongoDB Atlas)
- pip (Python package manager)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   - Copy `.env.example` to `.env` (if exists) or create a new `.env` file
   - Update the following variables:
     ```
     MONGODB_URL=mongodb://localhost:27017
     DATABASE_NAME=travel_planner
     SECRET_KEY=your-super-secret-key-change-this-in-production
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=30
     FRONTEND_URL=http://localhost:5173
     ```

5. **Start MongoDB:**
   - If using local MongoDB: `mongod`
   - If using MongoDB Atlas: Update `MONGODB_URL` in `.env`

6. **Run the application:**
   ```bash
   python run.py
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /auth/signup` - Create a new user account
- `POST /auth/login` - Authenticate user and get access token
- `GET /auth/me` - Get current user information

### Trips
- `POST /trips` - Create a new trip (requires authentication)
- `GET /trips` - Get all trips for authenticated user
- `PUT /trips/{trip_id}` - Update a specific trip

## Database Schema

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "string",
  "full_name": "string",
  "hashed_password": "string",
  "created_at": "datetime",
  "is_active": "boolean"
}
```

### Trips Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "destination": "string",
  "start_date": "string (optional)",
  "end_date": "string (optional)",
  "budget": "number",
  "currency": "string",
  "travelers": "number",
  "preferences": ["string"],
  "itinerary": ["object"],
  "flights": ["object"],
  "expenses": ["object"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Development

### Running in Development Mode
```bash
python run.py
```

This will start the server with auto-reload enabled.

### Testing the API

You can test the API using:
- The interactive docs at `/docs`
- curl commands
- Postman or similar tools
- The frontend application

Example curl command:
```bash
# Sign up
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "full_name": "Test User"}'

# Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## Production Deployment

For production deployment:

1. Update environment variables with production values
2. Use a production WSGI server like Gunicorn
3. Set up proper MongoDB security
4. Configure HTTPS
5. Set up proper logging and monitoring

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check the `MONGODB_URL` in `.env`

2. **Import Errors:**
   - Ensure virtual environment is activated
   - Install all dependencies: `pip install -r requirements.txt`

3. **CORS Issues:**
   - Check `FRONTEND_URL` in `.env`
   - Ensure frontend is running on the correct port

4. **Authentication Issues:**
   - Verify `SECRET_KEY` is set in `.env`
   - Check token expiration settings