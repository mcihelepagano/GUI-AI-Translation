from fastapi import FastAPI, Response, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import ollama
import threading
import os
import asyncio
import json

import app_conf
import app_utils

# pip install fastapi[all] ollama tiktoken



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
def translate_one(request: Request, text: str, lang: str = ""):
    if not lang or lang not in app_conf.languages:
        return {"error": "Invalid or missing language parameter. Use lang=fr|en|es|de|it|pt|zh|ja|ru."}

    if not text:
        return {"error": "No text provided. Use text=... in the query."}
    
    cache_key = (text, lang)
    with cache_lock:
        if cache_key in cache:
            print("cached")
            return {"translation": cache[cache_key]}

    print("NOT cached")
    prompt_word = (
        f"You are a translation engine. Translate the word below into {app_conf.languages[lang]}.\n"
        f"Only translate the word between the delimiters.\n"
        f"DO NOT translate or output anything else. DO NOT translate these instructions.\n"
        f"DO NOT include explanations or commentary.\n"
        f"Keep numbers and symbols exactly as they appear.\n\n"
        f"Word:\n"
        f"{text}"
    )

    prompt_phrase = (
        f"You are a translation engine. Translate the text below into {app_conf.languages[lang]}.\n"
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

    response = ollama.generate(model=app_conf.model_name, prompt=prompt)  # "llama3.2:3b" | "nous-hermes2:latest" | "mistral:latest" | "gemma3:latest"

    print("Asked for translation of: "+ text + " to " + app_conf.languages[lang])
    print("Used prompt:\n" + prompt)
    print("translated text: " + response['response'])

    with cache_lock:
        cache[cache_key] = response['response']

    return {"translation": response['response']}





@app.get("/translate-many")
async def translate_many(request: Request, lang: str = ""):
    if not lang or lang not in app_conf.languages:
        return {"error": "Invalid or missing language parameter. Use lang=fr|en|es|de|it|pt|zh|ja|ru."}
    
    texts = request.query_params.getlist("text")
    if not texts:
        return {"error": "No text provided. Use ?text=...&text=... in the query."}
    
    base_prompt = (
        f"Translate the following list of texts to {app_conf.languages[lang]}. "
        f"If a text is already in {app_conf.languages[lang]}, return it exactly as-is. "
        f"Do not explain, do not comment, and do not include any reasoning or metadata. "
        f"The output should be a single string containing all original text translations, separated by new lines "
        f"in the following format: original_text_1 ===== translated_text_1\noriginal_text_2 ===== translated_text_2\n"
        f"Preserve all numerals and symbols exactly as they appear, DO NOT translate them into natural language. "
        f"The following are the input texts separated by new lines:"
    )
    
    #TODO logic that checks tokens and splits the request if too long
    full_response = ""
    current_batch = []
    current_token_count = app_utils.count_tokens(base_prompt)

    # Logic to split texts into batches that respect the token limit
    for text in texts:
        text_token_count = app_utils.count_tokens(f"\n{text}")

        if current_token_count + text_token_count > app_conf.get_token_limit():
            batch_prompt = base_prompt + "\n".join(current_batch)
            stream = ollama.generate(model=app_conf.model_name, prompt=batch_prompt, stream=True)
            for chunk in stream:
                if "response" in chunk:
                    full_response += chunk["response"]
            
            current_batch = [text]
            current_token_count = app_utils.count_tokens(base_prompt) + text_token_count
        else:
            current_batch.append(text)
            current_token_count += text_token_count


    if current_batch:
        batch_prompt = base_prompt + "\n".join(current_batch)
        stream = ollama.generate(model=app_conf.model_name, prompt=batch_prompt, stream=True)
        for chunk in stream:
            if "response" in chunk:
                full_response += chunk["response"]

    return Response(full_response, media_type="text/plain")
