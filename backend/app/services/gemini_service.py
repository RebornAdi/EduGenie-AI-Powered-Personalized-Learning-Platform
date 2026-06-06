import json
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import google.generativeai as genai

from app.config import settings

_model = None


class AIServiceError(RuntimeError):
    pass


def _has_valid_gemini_key() -> bool:
    key = settings.gemini_api_key.strip()
    return len(key) >= 20 and key.lower() not in {
        "your_api_key_here",
        "your_gemini_api_key",
    }


def get_ai_provider() -> str:
    provider = settings.ai_provider.strip().lower()
    if provider == "auto":
        return "gemini" if _has_valid_gemini_key() else "ollama"
    if provider not in {"gemini", "ollama"}:
        raise AIServiceError(
            "AI_PROVIDER must be 'auto', 'gemini', or 'ollama'."
        )
    return provider


def get_ai_status() -> dict:
    provider = get_ai_provider()
    status = {
        "provider": provider,
        "model": (
            settings.gemini_model
            if provider == "gemini"
            else settings.ollama_model
        ),
    }
    if provider == "gemini":
        status["configured"] = _has_valid_gemini_key()
        if not status["configured"]:
            status["detail"] = "GEMINI_API_KEY is missing or invalid."
        return status

    tags_endpoint = f"{settings.ollama_base_url.rstrip('/')}/api/tags"
    try:
        with urlopen(tags_endpoint, timeout=3) as response:
            result = json.loads(response.read().decode("utf-8"))
        installed_models = {
            model.get("name") or model.get("model")
            for model in result.get("models", [])
        }
        status["configured"] = settings.ollama_model in installed_models
        if not status["configured"]:
            status["detail"] = (
                f"Local model is not installed. Run: ollama pull {settings.ollama_model}"
            )
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
        status["configured"] = False
        status["detail"] = "Ollama is not reachable. Start the Ollama application."
    return status


def _get_gemini_model():
    global _model
    if _model is None:
        if not _has_valid_gemini_key():
            raise AIServiceError(
                "Gemini is selected, but GEMINI_API_KEY is missing or invalid."
            )
        genai.configure(api_key=settings.gemini_api_key)
        _model = genai.GenerativeModel(settings.gemini_model)
    return _model


def _generate_with_gemini(prompt: str) -> str:
    try:
        response = _get_gemini_model().generate_content(prompt)
        text = response.text or ""
    except Exception as exc:
        raise AIServiceError(
            f"Gemini request failed for model '{settings.gemini_model}': {exc}"
        ) from exc
    if not text.strip():
        raise AIServiceError("Gemini returned an empty response.")
    return text


def _generate_with_ollama(prompt: str, json_mode: bool = False) -> str:
    endpoint = f"{settings.ollama_base_url.rstrip('/')}/api/generate"
    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
    }
    if json_mode:
        payload["format"] = "json"

    request = Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(
            request,
            timeout=settings.ai_request_timeout_seconds,
        ) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise AIServiceError(f"Ollama request failed ({exc.code}): {detail}") from exc
    except URLError as exc:
        raise AIServiceError(
            "Cannot connect to Ollama. Start Ollama and pull the configured model "
            f"with: ollama pull {settings.ollama_model}"
        ) from exc
    except (TimeoutError, json.JSONDecodeError) as exc:
        raise AIServiceError(f"Ollama returned an invalid response: {exc}") from exc

    text = result.get("response", "")
    if not text.strip():
        raise AIServiceError("Ollama returned an empty response.")
    return text


def generate_text(prompt: str) -> str:
    if get_ai_provider() == "gemini":
        return _generate_with_gemini(prompt)
    return _generate_with_ollama(prompt)


def generate_json(prompt: str) -> list | dict:
    json_prompt = prompt + "\n\nRespond with valid JSON only, no markdown."
    if get_ai_provider() == "gemini":
        text = _generate_with_gemini(json_prompt)
    else:
        text = _generate_with_ollama(json_prompt, json_mode=True)
    text = re.sub(r"```json\s*|\s*```", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise AIServiceError("The AI model returned invalid JSON.") from exc
