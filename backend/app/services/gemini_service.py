import json
import re

import google.generativeai as genai

from app.config import settings

_model = None


def _get_model():
    global _model
    if _model is None:
        if not settings.gemini_api_key:
            return None
        genai.configure(api_key=settings.gemini_api_key)
        _model = genai.GenerativeModel("gemini-1.5-flash")
    return _model


def _fallback_response(prompt: str) -> str:
    return (
        "AI service is not configured. Please set GEMINI_API_KEY in your environment. "
        f"Your question was: {prompt[:200]}"
    )


def generate_text(prompt: str) -> str:
    model = _get_model()
    if model is None:
        return _fallback_response(prompt)
    try:
        response = model.generate_content(prompt)
        return response.text or ""
    except Exception as e:
        return f"AI generation failed: {str(e)}"


def generate_json(prompt: str) -> list | dict:
    text = generate_text(prompt + "\n\nRespond with valid JSON only, no markdown.")
    text = re.sub(r"```json\s*|\s*```", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return []
