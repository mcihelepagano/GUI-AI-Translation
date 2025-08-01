from fastapi import FastAPI, Response, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import ollama
import threading
import os
import asyncio
import json

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

model_name = os.getenv("OLLAMA_MODEL_NAME_SDP", "llama3.2:3b")
print(f"Running with model: {model_name}")

app = FastAPI()

app.mount("/static", StaticFiles(directory="../frontend"), name="static")

cache = {}
cache_lock = threading.Lock()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
    max_age=86400
)

@app.middleware("http")
async def add_pna_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response

@app.get("/translate-one")
def translate_one(request: Request, text: str, lang: str = "English"):
    cache_key = (text, lang)
    with cache_lock:
        if cache_key in cache:
            print("cached")
            return {"translation": cache[cache_key]}

    print("NOT cached")
    prompt_word = (
        f"You are a translation engine. Translate the word below into {languages[lang]}.\n"
        f"Only translate the word between the delimiters.\n"
        f"DO NOT translate or output anything else. DO NOT translate these instructions.\n"
        f"DO NOT include explanations or commentary.\n"
        f"Keep numbers and symbols exactly as they appear.\n\n"
        f"Word:\n"
        f"{text}"
    )

    prompt_phrase = (
        f"You are a translation engine. Translate the text below into {languages[lang]}.\n"
        f"Only translate the text between the delimiters.\n"
        f"DO NOT translate or output anything else. DO NOT translate these instructions.\n"
        f"DO NOT include explanations or commentary.\n"
        f"Keep numbers and symbols exactly as they appear.\n\n"
        f"Text:\n"
        f"{text}"
    )

    if (len(text.split(" ")) != 1):
        prompt = prompt_phrase
    else:
        prompt = prompt_word

    response = ollama.generate(model=model_name, prompt=prompt)  # "llama3.2:3b" | "nous-hermes2:latest" | "mistral:latest" | "gemma3:latest"

    print("Asked for translation of: "+ text + " to " + languages[lang])
    print("Used prompt:\n" + prompt)
    print("translated text: " + response['response'])

    with cache_lock:
        cache[cache_key] = response['response']

    return {"translation": response['response']}





@app.get("/translate-many")
async def translate_many(request: Request, lang: str = "English"):
    texts = request.query_params.getlist("text")
    if not texts:
        return {"error": "No text provided. Use ?text=...&text=... in the query."}
    prompt = (
        f"Translate the following list of texts to {lang}. "
        f"If a text is already in {lang}, return it exactly as-is. "
        f"Do not explain, do not comment, and do not include any reasoning or metadata. "
        f"The output should be a single string containing all original text translations, separated by new lines "
        f"in the following format: original_text_1 ===== translated_text_1\noriginal_text_2 ===== translated_text_2\n"
        f"Preserve all numerals and symbols exactly as they appear, DO NOT translate them into natural language. "
        f"The following are the input texts separated by new lines:"
    )
    prompt += "\n".join(texts)
    
    #TODO logic that checks tokens and splits the request if too long


    stream = ollama.generate(model=model_name, prompt=prompt, stream=True)

    def stream_response():
        buffer = ""
        for chunk in stream:
            if "response" in chunk:
                buffer += chunk["response"]
                if "\n" in buffer:
                    parts = buffer.split("\n")
                    for part in parts[:-1]:
                        yield part + "\n"
                    buffer = parts[-1]
        if buffer:
            yield buffer

    return StreamingResponse(stream_response(), media_type="text/plain")