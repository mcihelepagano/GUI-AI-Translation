import sys
import os
import subprocess
import threading
import time
import logging

def setup_logger():
    logger = logging.getLogger("ProcessLogger")
    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler()
    formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] %(message)s', "%H:%M:%S")
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger

logger = setup_logger()


def stream_output(pipe, prefix):
    try:
        for line in iter(pipe.readline, ''):
            if line:
                logger.info(f"[{prefix}] {line.rstrip()}")
    finally:
        pipe.close()


def start_ollama(model_name):
    logger.info(f"Starting Ollama with model: {model_name}")

    proc = subprocess.Popen(
        ["ollama", "run", model_name],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        bufsize=1,
        text=True
    )
    threading.Thread(
        target=stream_output, args=(proc.stdout, "OLLAMA"), daemon=True
    ).start()
    return proc


def start_fastapi(script, model_name):
    logger.info(f"Starting FastAPI with script: {script} and model_name: {model_name}")
    
    env = os.environ.copy()
    env["OLLAMA_MODEL_NAME_SDP"] = model_name
    proc = subprocess.Popen(
        [sys.executable, "-m", "fastapi", "dev", script],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        bufsize=1,
        text=True,
        env=env
    )
    threading.Thread(target=stream_output, args=(proc.stdout, "SERVER"), daemon=True).start()
    return proc



def main():
    try:
        model_name = "llama3.2:3b"
        fastapi_script = "index.py"

        ollama_proc = start_ollama(model_name)
        time.sleep(5) 
        fastapi_proc = start_fastapi(fastapi_script, model_name)


        logger.info("✅ Servers running. Press Ctrl+C to stop everything.")

        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        logger.warning("Stopping servers...")
        ollama_proc.terminate()
        fastapi_proc.terminate()
        logger.info("✅ Done.")

if __name__ == "__main__":
    main()
