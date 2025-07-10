from pydantic import BaseModel, EmailStr, Field, GetCoreSchemaHandler
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source, handler: GetCoreSchemaHandler):
        from pydantic_core import core_schema
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema(),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        # This tells Pydantic v2 to treat this as a string in OpenAPI/JSON Schema
        return {'type': 'string'}

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    email: EmailStr
    full_name: str
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    created_at: datetime
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class TripCreate(BaseModel):
    destination: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: float
    currency: str
    travelers: int
    preferences: List[str] = []

class Trip(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId
    destination: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: float
    currency: str
    travelers: int
    preferences: List[str] = []
    itinerary: Optional[List[dict]] = []
    flights: Optional[List[dict]] = []
    expenses: Optional[List[dict]] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        validate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class TripUpdate(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = None
    currency: Optional[str] = None
    travelers: Optional[int] = None
    preferences: Optional[List[str]] = None

class ItineraryRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    budget: float
    currency: str
    travelers: int
    preferences: List[str]

class ItineraryItem(BaseModel):
    id: str
    day: int
    time: str
    title: str
    description: str
    location: str
    type: str
    duration: str
    cost: float
    rating: float
    completed: bool = False

class ItineraryResponse(BaseModel):
    itinerary: List[ItineraryItem]