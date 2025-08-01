from fastapi import FastAPI, Response, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import ollama
import threading
import os
import asyncio
import json



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
    prompt = (
        f"Translate the following text to {lang}. "
        f"If the text is already in {lang}, return it exactly as-is. "
        f"Do not explain, do not comment, and do not include any reasoning or metadata. "
        f"Output ONLY the translated sentence — no quotes, no preface, no labels, no commentary, no formatting. "
        f"Preserve all numerals and symbols exactly as they appear, DO NOT translate them into natural language. "
        f"Input-text: {text}"
    )
    response = ollama.generate(model=model_name, prompt=prompt)  # "llama3.2:3b" | "nous-hermes2:latest" | "mistral:latest" | "gemma3:latest"

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