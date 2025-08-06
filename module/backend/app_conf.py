
import os

model_name = os.getenv("OLLAMA_MODEL_NAME_SDP", "llama3.2:3b")
print(f"Running with model: {model_name}")


def get_token_limit() -> int:
    """Returns the token limit for the model."""
    if model_name.startswith("llama3.2"):
        return 8192
    elif model_name.startswith("mistral"):
        return 4096
    elif model_name.startswith("gemma3"):
        return 8192
    elif model_name.startswith("nous-hermes2"):
        return 4096
    else:
        return 2048
    

languages = {
    "fr": "French",
    "en": "English",
    "es": "Spanish",
    "de": "German",
    "it": "Italian",
    "pt": "Portugese",
    "zh": "Chinese",
    "ja": "Japanese",
    "ru": "Russian",
}
