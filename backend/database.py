from pymongo import MongoClient
from pymongo.database import Database
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "travel_planner")

class MongoDB:
    client: Optional[MongoClient] = None
    database: Optional[Database] = None
    connected: bool = False

db = MongoDB()

def connect_to_mongo():
    """Create database connection"""
    try:
        db.client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        # Test the connection
        db.client.admin.command('ping')
        db.database = db.client[DATABASE_NAME]
        db.connected = True
        print(f"✅ Connected to MongoDB at {MONGODB_URL}")
    except Exception as e:
        print(f"⚠️  MongoDB connection failed: {e}")
        print("🔧 Running in development mode without database")
        db.connected = False

def close_mongo_connection():
    """Close database connection"""
    if db.client and db.connected:
        db.client.close()
        db.connected = False
        print("Disconnected from MongoDB")

def get_database() -> Optional[Database]:
    """Get database instance"""
    if not db.connected:
        raise Exception("MongoDB not connected. Please check your connection string.")
    return db.database

def is_connected() -> bool:
    """Check if MongoDB is connected"""
    return db.connected