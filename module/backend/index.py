from fastapi import FastAPI, Response, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import ollama
import threading

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

@app.get("/translate")
def translate(request: Request, text: str, lang: str = "English"):
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
    response = ollama.generate(model='gemma3:latest', prompt=prompt)  # "llama3.2:3b" | "nous-hermes2:latest" | "mistral:latest" | "gemma3:latest"

    with cache_lock:
        cache[cache_key] = response['response']

    return {"translation": response['response']}