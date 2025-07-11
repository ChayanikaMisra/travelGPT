from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pymongo.database import Database
from datetime import timedelta
from bson import ObjectId
import os
from dotenv import load_dotenv
from fastapi import Request


import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

from database import connect_to_mongo, close_mongo_connection, get_database, is_connected
from models import (
    UserCreate, UserLogin, UserResponse, Token, TripCreate, Trip, User,
    ItineraryRequest, ItineraryResponse
)
from auth import (
    get_password_hash, authenticate_user, create_access_token, 
    get_current_active_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from itinerary_service import generate_itinerary

load_dotenv()

app = FastAPI(title="Travel Planner API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://localhost:3000",
        "https://localhost:5173",
        "https://travelgpt-production.up.railway.app",
        "https://*.up.railway.app",  # Allow all Railway subdomains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

@app.on_event("startup")
async def startup_db_client():
    connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    close_mongo_connection()

@app.get("/")
async def root():
    return {"message": "Travel Planner API"}

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.debug(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.debug(f"Response status: {response.status_code}")
    return response

@app.post("/auth/signup", response_model=UserResponse)
async def signup(user_data: UserCreate, db: Database = Depends(get_database)):
    """Create a new user account"""
    if not is_connected():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available. Please check MongoDB connection."
        )
    
    # Check if user already exists
    logger.debug(f"Signup attempt for email: {user_data.email}")
    if db.users.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user_dict = {
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "is_active": True
    }
    
    result = db.users.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    
    user = User(**user_dict)
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        created_at=user.created_at,
        is_active=user.is_active
    )

@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Database = Depends(get_database)):
    """Authenticate user and return access token"""
    if not is_connected():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available. Please check MongoDB connection."
        )
    
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )

@app.post("/itinerary/generate", response_model=ItineraryResponse)
async def generate_trip_itinerary(request: ItineraryRequest):
    """Generate a personalized itinerary using OpenAI"""
    try:
        itinerary_items = generate_itinerary(request)
        return ItineraryResponse(itinerary=itinerary_items)
    except Exception as e:
        logger.error(f"Error generating itinerary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate itinerary"
    )

@app.post("/trips", response_model=dict)
async def create_trip(
    trip_data: TripCreate,
    current_user: User = Depends(get_current_active_user),
    db: Database = Depends(get_database)
):
    """Create a new trip for the authenticated user"""
    trip_dict = trip_data.dict()
    trip_dict["user_id"] = current_user.id
    
    result = db.trips.insert_one(trip_dict)
    trip_dict["_id"] = result.inserted_id
    
    # Convert ObjectId to string for JSON response
    trip_dict["id"] = str(trip_dict["_id"])
    del trip_dict["_id"]
    trip_dict["user_id"] = str(trip_dict["user_id"])
    
    return trip_dict

@app.get("/trips", response_model=list)
async def get_user_trips(
    current_user: User = Depends(get_current_active_user),
    db: Database = Depends(get_database)
):
    """Get all trips for the authenticated user"""
    trips = list(db.trips.find({"user_id": current_user.id}))
    
    # Convert ObjectIds to strings
    for trip in trips:
        trip["id"] = str(trip["_id"])
        del trip["_id"]
        trip["user_id"] = str(trip["user_id"])
    
    return trips

@app.put("/trips/{trip_id}", response_model=dict)
async def update_trip(
    trip_id: str,
    trip_updates: dict,
    current_user: User = Depends(get_current_active_user),
    db: Database = Depends(get_database)
):
    """Update a trip for the authenticated user"""
    if not ObjectId.is_valid(trip_id):
        raise HTTPException(status_code=400, detail="Invalid trip ID")
    
    # Check if trip exists and belongs to user
    trip = db.trips.find_one({"_id": ObjectId(trip_id), "user_id": current_user.id})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Update trip
    result = db.trips.update_one(
        {"_id": ObjectId(trip_id)},
        {"$set": trip_updates}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="No changes made")
    
    # Return updated trip
    updated_trip = db.trips.find_one({"_id": ObjectId(trip_id)})
    updated_trip["id"] = str(updated_trip["_id"])
    del updated_trip["_id"]
    updated_trip["user_id"] = str(updated_trip["user_id"])
    
    return updated_trip
