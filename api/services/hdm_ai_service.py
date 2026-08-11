import httpx
from config.settings import settings
from utils.logger import logger


class HdmAIService:
    def __init__(self):
        self.base_url = settings.HDM_AI_URL
        self.api_key = settings.HDM_AI_API_KEY

    async def analyze(self, image_path: str, crop_type: str = None):
        """Analyze crop image using HDM AI API."""
        async with httpx.AsyncClient() as client:
            with open(image_path, "rb") as f:
                files = {"image": f}
                data = {"crop_type": crop_type} if crop_type else {}

                response = await client.post(
                    f"{self.base_url}/analyze",
                    files=files,
                    data=data,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    timeout=30
                )

                if response.status_code == 200:
                    result = response.json()
                    logger.info(f"HDM AI analysis: {result.get('disease')}")
                    return result
                else:
                    logger.error(f"HDM AI error: {response.status_code}")
                    return {
                        "disease": "Error",
                        "confidence": 0,
                        "severity": "unknown",
                        "recommendation": "AI service unavailable"
                    }


hdm_ai_service = HdmAIService()