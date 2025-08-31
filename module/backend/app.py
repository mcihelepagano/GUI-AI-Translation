from fastapi import FastAPI, Response, Request, Query, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List
from pydantic import BaseModel
import ollama
import threading
import string
import time

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
    allow_credentials=False,
)


translate_many_times = []
translate_many_lock = threading.Lock()

translate_one_times = []
translate_one_lock = threading.Lock()


def stats_printer():
    while True:
        time.sleep(60)  # every 1 min
        # --- stats for /translate-one ---
        with translate_one_lock:
            if translate_one_times:
                tot_time = sum(translate_one_times)
                avg_time = tot_time / len(translate_one_times)
                min_time = min(translate_one_times)
                max_time = max(translate_one_times)
                print(f"[STATS] /translate-one calls: {len(translate_one_times)} "
                      f"| avg: {avg_time:.2f} ms | min: {min_time:.2f} ms | max: {max_time:.2f} ms | tot: {tot_time:.2f} ms"
                      ,flush=True)
            else:
                print("[STATS] /translate-one has no calls yet",flush=True)

        # --- stats for /translate-many ---
        with translate_many_lock:
            if translate_many_times:
                tot_time = sum(translate_many_times)
                avg_time = tot_time / len(translate_many_times)
                min_time = min(translate_many_times)
                max_time = max(translate_many_times)
                print(f"[STATS] /translate-many calls: {len(translate_many_times)} "
                      f"| avg: {avg_time:.2f} ms | min: {min_time:.2f} ms | max: {max_time:.2f} ms | tot: {tot_time:.2f} ms"
                      ,flush=True)
            else:
                print("[STATS] /translate-many has no calls yet",flush=True)


@app.on_event("startup")
def start_background_tasks():
    t = threading.Thread(target=stats_printer, daemon=True)
    t.start()



@app.get("/translate-one")
def translate_one(request: Request, text: str, lang: str = ""):
    start_time = time.perf_counter()
    if not lang or lang not in app_conf.languages:
        raise HTTPException(status_code=400, detail="Invalid or missing language parameter. Use lang=fr|en|es|de|it|pt|zh|ja|ru.")

    if not text:
        raise HTTPException(status_code=400, detail="No text provided. Use text=... in the query.")

    cache_key = (text, lang)
    with cache_lock:
        if cache_key in cache:
            elapsed_ms = (time.perf_counter() - start_time) * 1000
            with translate_one_lock:
                translate_one_times.append(elapsed_ms)
            print("cached")
            return {"translation": cache[cache_key]}

    print("NOT cached")

    symbol_chars = "!\"#$%&'*+,-/:;<=>?@[\]^_`{|}~" + " "

    leading_spaces = len(text) - len(text.lstrip(symbol_chars))
    trailing_spaces = len(text) - len(text.rstrip(symbol_chars))
    original_leading = text[:leading_spaces]
    original_trailing = text[len(text) - trailing_spaces:]

    stripped_text = text.strip(symbol_chars)

    if (len(stripped_text.split(" ")) != 1):
        prompt = app_utils.get_prompt("phrase", app_conf.languages[lang], [stripped_text])
    else:
        prompt = app_utils.get_prompt("word", app_conf.languages[lang], [stripped_text])

    response = ollama.generate(model=app_conf.model_name, prompt=prompt)  # "llama3.2:3b" | "nous-hermes2:latest" | "mistral:latest" | "gemma3:latest"

    translation = original_leading + response["response"] + original_trailing

    print("Asked for translation of: "+ text + " to " + app_conf.languages[lang])
    print("translated text: " + translation)

    with cache_lock:
        cache[cache_key] = translation

        
    elapsed_ms = (time.perf_counter() - start_time) * 1000
    with translate_one_lock:
        translate_one_times.append(elapsed_ms)

    return {"translation": translation}





class TextList(BaseModel):
    texts: List[str]

@app.post("/translate-many")
async def translate_many(request: Request, body: TextList, lang: str = Query(...)):
    if not lang or lang not in app_conf.languages:
        raise HTTPException(status_code=400, detail="Invalid or missing language parameter. Use lang=fr|en|es|de|it|pt|zh|ja|ru.")

    if not body or not body.texts:
        raise HTTPException(status_code=400, detail="No text provided. Use ?text=...&text=... in the query.")
    
    prompts = app_utils.split_prompts_by_token_limit("phrase_list", lang, body.texts)

    start_time = time.perf_counter()

    # wrap the generator so we know when it finishes
    def timed_stream(prompts: list[str]):
        for chunk in stream_AI_response(prompts):
            yield chunk
        # when generator completes, record elapsed time
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        with translate_many_lock:
            translate_many_times.append(elapsed_ms)

    return StreamingResponse(
        timed_stream(prompts),
        media_type="text/plain"
    )


def stream_AI_response(prompts: list[str]):
    print("Starting streaming response from AI model...")
    def generator():
        for prompt in prompts:
            stream = ollama.generate(model=app_conf.model_name, prompt=prompt, stream=True)
            buffer = ""
            for chunk in stream:
                if "response" in chunk:
                    buffer += chunk["response"]
                    if "\n" in buffer:
                        parts = buffer.split("\n")
                        for part in parts[:-1]:
                            print(part, flush=True)
                            yield part + "\n"
                        buffer = parts[-1]
            if buffer:
                print(buffer, flush=True)
                yield buffer + "\n"

    return generator()