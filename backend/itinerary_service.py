from openai import OpenAI
import os
import json
from typing import List
from models import ItineraryItem, ItineraryRequest
import os
from fastapi import HTTPException

from dotenv import load_dotenv
load_dotenv()

FOOD_KEYWORDS = ["lunch", "dinner", "breakfast", "brunch", "wine", "meal", "restaurant", "cafe", "food", "tasting", "snack", "coffee", "tea"]

def is_food_item(title, description):
    text = f"{title} {description}".lower()
    return any(word in text for word in FOOD_KEYWORDS)

def generate_itinerary(request: ItineraryRequest) -> List[ItineraryItem]:
    """
    Generate a personalized itinerary using OpenAI GPT
    """
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    from datetime import datetime
    # Validate required fields
    if not request.destination or not request.destination.strip():
        raise HTTPException(status_code=400, detail="Destination is required.")
    if not request.budget or request.budget <= 0:
        raise HTTPException(status_code=400, detail="Budget must be greater than 0.")
    if not request.currency or not request.currency.strip():
        request.currency = "USD"
    if not request.travelers or request.travelers <= 0:
        request.travelers = 1
    # Handle missing dates
    num_days = 3  # fallback default
    has_dates = (
        isinstance(request.start_date, str) and request.start_date.strip() != "" and
        isinstance(request.end_date, str) and request.end_date.strip() != ""
    )
    if has_dates:
        try:
            start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
            end_date = datetime.strptime(request.end_date, "%Y-%m-%d")
            num_days = (end_date - start_date).days + 1
        except Exception:
            has_dates = False
    preferences_text = ", ".join(request.preferences) if request.preferences else "general travel"    # Compose a user-style prompt using frontend inputs
    prompt = f"""Generate a {num_days}-day itinerary for me. You are my travel agent. My budget is {request.budget} {request.currency}. I am travelling to {request.destination} with {request.travelers} traveler(s)."""
    if has_dates:
        prompt += f" My trip is from {request.start_date} to {request.end_date}."
    if preferences_text and preferences_text != "general travel":
        prompt += f" My interests are: {preferences_text}."
    # Add explicit instruction for structured daywise itinerary
    prompt += (
        "\nFor each activity/expense, use one of these categories: 'food', 'activities', 'transportation', 'accommodation', 'shopping', 'entertainment', 'health', 'other'."
        "\nExamples:"
        "\n- 'Lunch at Bistro' → category: 'food'"
        "\n- 'Wine tasting tour' → category: 'food'"
        "\n- 'Visit the Louvre' → category: 'activities'"
        "\n- 'Metro ticket' → category: 'transportation'"
        "\n- 'Hotel check-in' → category: 'accommodation'"
        "\n- 'Buy souvenirs' → category: 'shopping'"
        "\n- 'Concert ticket' → category: 'entertainment'"
        "\n- 'Pharmacy purchase' → category: 'health'"
        "\nIf unsure, use the closest matching category."
        "\nPlease return the itinerary as a JSON array. Each element should be an object with: 'day' (integer), and 'expenses' (an object with keys as categories like 'food', 'activities', 'transportation', etc., and values as lists of activities/expenses for that category)."
        "\nEach activity/expense should have: 'name', 'description', 'cost', 'time', and 'category'."
        "\nExample:\n"
        '[\n'
        '  {"day": 1, "expenses": {\n'
        '    "food": [\n'
        '      {"name": "Lunch at Bistro", "description": "French cuisine", "cost": 25.0, "time": "12:00", "category": "food"}\n'
        '    ],\n'
        '    "activities": [\n'
        '      {"name": "Louvre Visit", "description": "Art museum", "cost": 17.0, "time": "09:00", "category": "activities"}\n'
        '    ],\n'
        '    "transportation": [\n'
        '      {"name": "Metro Ticket", "description": "Subway ride", "cost": 2.5, "time": "08:30", "category": "transportation"}\n'
        '    ]\n'
        '  }},\n'
        '  {"day": 2, "expenses": {\n'
        '    "food": [\n'
        '      {"name": "Breakfast at Cafe", "description": "Coffee and croissant", "cost": 8.0, "time": "08:00", "category": "food"}\n'
        '    ],\n'
        '    "activities": [\n'
        '      {"name": "Eiffel Tower", "description": "Landmark visit", "cost": 20.0, "time": "10:00", "category": "activities"}\n'
        '    ]\n'
        '  }}\n'
        ']'
    )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert travel planner with deep knowledge of destinations worldwide. Generate detailed, personalized itineraries in JSON format only. Always consider budget constraints, traveler preferences, and realistic timing."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=2500
        )
        print("open ai response", response)
        content = response.choices[0].message.content.strip()
        try:
            itinerary_data = json.loads(content)
            itinerary_items = []
            if isinstance(itinerary_data, list):
                item_id = 1
                for day_obj in itinerary_data:
                    day_num = day_obj.get("day", "")
                    expenses_by_category = day_obj.get("expenses", {})
                    for category, activities in expenses_by_category.items():
                        for activity in activities:
                            title = activity.get("name", "")
                            description = activity.get("description", "")
                            cost = float(activity.get("cost", 0.0))
                            time = activity.get("time", "")
                            activity_category = activity.get("category", category)
                            if is_food_item(title, description):
                                activity_category = "food"
                            itinerary_items.append(ItineraryItem(
                                id=str(item_id),
                                day=day_num,
                                time=time,
                                title=title,
                                description=description,
                                location=request.destination,
                                type=activity_category,
                                duration="",
                                cost=cost,
                                rating=4.5,
                                completed=False
                            ))
                            item_id += 1


            print("itinerary_items", itinerary_items)
            return itinerary_items
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw response: {content}")
            return generate_fallback_itinerary(request, num_days)
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return generate_fallback_itinerary(request, num_days)

def generate_fallback_itinerary(request: ItineraryRequest, num_days: int) -> List[ItineraryItem]:
    """
    Generate a basic fallback itinerary if OpenAI fails
    """
    fallback_items = []
    item_id = 1
    
    for day in range(1, num_days + 1):
        # Morning activity
        fallback_items.append(ItineraryItem(
            id=str(item_id),
            day=day,
            time="09:00",
            title=f"Day {day} Morning Activity",
            description=f"Explore {request.destination} and discover local attractions.",
            location=f"{request.destination} City Center",
            type="activity",
            duration="2 hours",
            cost=20.0,
            rating=4.5,
            completed=False
        ))
        item_id += 1
        
        # Lunch
        fallback_items.append(ItineraryItem(
            id=str(item_id),
            day=day,
            time="12:00",
            title=f"Lunch at Local Restaurant",
            description=f"Enjoy local cuisine at a recommended restaurant in {request.destination}.",
            location="Local Restaurant",
            type="restaurant",
            duration="1 hour",
            cost=30.0,
            rating=4.3,
            completed=False
        ))
        item_id += 1
        
        # Afternoon activity
        fallback_items.append(ItineraryItem(
            id=str(item_id),
            day=day,
            time="14:00",
            title=f"Afternoon Exploration",
            description=f"Continue exploring {request.destination} and visit popular attractions.",
            location=f"{request.destination} Attractions",
            type="attraction",
            duration="3 hours",
            cost=25.0,
            rating=4.4,
            completed=False
        ))
        item_id += 1
    
    return fallback_items 