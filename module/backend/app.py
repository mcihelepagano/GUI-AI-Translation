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

def addToCache(cache_key, translation: str):
    with cache_lock:
        cache[cache_key] = translation

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

    addToCache(cache_key, translation)
        
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
    
    input_map = {i: value for i, value in enumerate(body.texts)}
    cached_output_map = {}
    cache_hits = 0
    for i, text in input_map.items():
        cache_key = (text, lang)
        with cache_lock:
            if cache_key in cache:
                cached_output_map[i] = cache[cache_key]
                cache_hits += 1
    print(f"Cache hits: {cache_hits}/{len(body.texts)}")
    
    input_map = {i: text for i, text in input_map.items() if i not in cached_output_map}
    if not input_map:
        print("All texts were cached.")
        prompts=[]
    else:
        prompts = app_utils.split_prompts_by_token_limit("phrase_list", lang, input_map)

    start_time = time.perf_counter()

    # wrap the generator so we know when it finishes
    def timed_stream(prompts: list[str], input_map: dict[int, str], cached_output_map: dict[int, str], lang):
        for i in sorted(cached_output_map.keys()):
            yield f"{i}->{cached_output_map[i]}\n"
        
        if prompts:
            for chunk in stream_AI_response(prompts, input_map, lang):
                yield chunk
        # when generator completes, record elapsed time
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        print(f"translate_many completed in {elapsed_ms:.2f} ms", flush=True)
        with translate_many_lock:
            translate_many_times.append(elapsed_ms)

    return StreamingResponse(
        timed_stream(prompts, input_map, cached_output_map, lang),
        media_type="text/plain"
    )



def stream_AI_response(prompts: list[str], input_map: dict[int, str], lang: str):
    print("Starting streaming response from AI model...")
    def generator():
        index_separator = "->"
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
                            
                            if index_separator in part:
                                index_str, translation = part.split(index_separator, 1)
                                try:
                                    index = int(index_str)
                                    if index in input_map:
                                        addToCache((input_map[index], lang), translation)
                                    else:
                                        print(f"Warning: caching -> index {index} not found in input_map", flush=True)
                                except ValueError:
                                    print(f"Warning: caching -> could not convert index '{index_str}' to int in part '{part}'", flush=True)

                            yield part + "\n"
                        buffer = parts[-1]
            if buffer:
                print(buffer, flush=True)
                if index_separator in part:
                    index_str, translation = part.split(index_separator, 1)
                    try:
                        index = int(index_str)
                        if index in input_map:
                            addToCache((input_map[index], lang), translation)
                        else:
                            print(f"Warning: caching -> index {index} not found in input_map", flush=True)
                    except ValueError:
                        print(f"Warning: caching -> could not convert index '{index_str}' to int in part '{part}'", flush=True)
                yield buffer + "\n"

    return generator()