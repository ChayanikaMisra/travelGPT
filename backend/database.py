from pymongo import MongoClient
from pymongo.database import Database
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "travel_planner")

class MongoDB:
    client: MongoClient = None
    database: Database = None

db = MongoDB()

def connect_to_mongo():
    """Create database connection"""
    db.client = MongoClient(MONGODB_URL)
    db.database = db.client[DATABASE_NAME]
    print(f"Connected to MongoDB at {MONGODB_URL}")

def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("Disconnected from MongoDB")

def get_database() -> Database:
    """Get database instance"""
    return db.database