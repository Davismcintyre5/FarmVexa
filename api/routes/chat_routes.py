from fastapi import APIRouter, Header, HTTPException
from config.settings import settings
from utils.validator import validate_request_api_key
from utils.response_formatter import success_response, error_response
from utils.logger import logger
import google.generativeai as genai

router = APIRouter()

# System prompt to restrict to agriculture only
SYSTEM_PROMPT = """You are FarmVexa AI, an agricultural assistant for farmers. 

You ONLY answer questions related to:
- Crop farming (tomatoes, maize, potatoes, beans, cassava, coffee, tea, wheat, rice)
- Crop diseases, pests, and treatment
- Soil health and management
- Irrigation and water management
- Fertilizers and nutrients
- Weather and climate impacts on farming
- Harvesting and post-harvest handling
- Organic farming practices
- Farm equipment and tools
- Livestock and poultry farming
- Farm business and market tips

If a user asks anything outside agriculture (like sports, politics, technology, entertainment, coding, etc.), respond ONLY with:
"I'm your FarmVexa agricultural assistant. I can only help with farming-related questions. Please ask me about crops, soil, livestock, pests, diseases, or any other farming topic."

Do not answer non-agricultural questions under any circumstances.
Keep responses practical, concise, and helpful for farmers.
Use simple language that farmers can understand."""


def get_chat_response(message: str, history: list = None):
    """Get agriculture-only response from Gemini."""
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("models/gemini-3.5-flash")
    
    # Build conversation
    chat = model.start_chat(history=[])
    
    # First message sets the context
    full_prompt = f"{SYSTEM_PROMPT}\n\nFarmer's question: {message}"
    
    response = chat.send_message(full_prompt)
    return response.text


@router.post("/chat")
async def farmer_chat(
    data: dict,
    x_api_key: str = Header(None)
):
    """FarmVexa farmer chat - agriculture questions only."""
    try:
        await validate_request_api_key(x_api_key)
        
        message = data.get("message", "")
        history = data.get("history", [])
        
        if not message:
            return error_response("Message is required", 400)
        
        reply = get_chat_response(message, history)
        
        logger.info(f"Chat: '{message[:50]}...' → Answered")
        
        return success_response({
            "reply": reply,
            "model": "gemini-3.5-flash"
        }, "Chat response")
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return error_response(str(e), 500)