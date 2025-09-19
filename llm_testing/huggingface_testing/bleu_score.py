from transformers import AutoModelForCausalLM, AutoTokenizer, logging, BitsAndBytesConfig
from huggingface_hub import login
import torch
import sacrebleu
import time
import os

torch._dynamo.disable()
logging.set_verbosity_error()

#login(token="") # put the hugging face token here

MODEL_PATH = "TinyLlama/TinyLlama-1.1B-Chat-v0.6"

SOURCE_FILE = "../europarl-v7.it-en.en"
REFERENCE_FILE = "../europarl-v7.it-en.it"
OUTPUT_FILE = "generated_translations.it"

MAX_SENTENCES = 1000
BLEU_INTERVAL = 1000

os.environ["TORCHINDUCTOR_DISABLE"] = "1"
os.environ["DISABLE_TORCHINDUCTOR"] = "1"
os.environ["TORCHDYNAMO_DISABLE"] = "1"

device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16

print(f"Loading model: {MODEL_PATH} on device: {device}")

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",  # or "fp4"
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.float16,
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(MODEL_PATH, torch_dtype=dtype).to(device)
# model = AutoModelForCausalLM.from_pretrained(MODEL_PATH, quantization_config=bnb_config, torch_dtype=dtype).to(device) # use this to perform local quantization of the model
model.eval()

# Load input data
with open(SOURCE_FILE, "r", encoding="utf-8") as f:
    source_sentences = [line.strip() for i, line in enumerate(f) if i < MAX_SENTENCES]

with open(REFERENCE_FILE, "r", encoding="utf-8") as f:
    references = [line.strip() for i, line in enumerate(f) if i < MAX_SENTENCES]

hypotheses = []

print(f"Translating {len(source_sentences)} sentences...")

start_time = time.time()

for i, sentence in enumerate(source_sentences):
    if i % 10 == 0:
        print(f"Translating sentence {i+1}/{len(source_sentences)}")

    prompt = f"English sentence: {sentence}. Translate the sentence to Italian and output only the sentence, no explanation, commentary or labels:"

    inputs = tokenizer(prompt, return_tensors="pt").to(device)

    with torch.no_grad():
        output = model.generate(
        **inputs,
        max_new_tokens=100,
        do_sample=False,
        pad_token_id=tokenizer.eos_token_id,
        eos_token_id=tokenizer.eos_token_id
    )

    generated_tokens = output[0][inputs['input_ids'].shape[1]:]
    translation = tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()
    translation = translation.split("\n")[0].strip()

    hypotheses.append(translation)

end_time = time.time()
minutes, seconds = divmod(end_time - start_time, 60)

print(f"Total time: {int(minutes)}m {int(seconds)}s")

bleu = sacrebleu.corpus_bleu(hypotheses, [references])
print(f"\nFinal BLEU score: {bleu.score:.2f}")

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(f"Total time: {int(minutes)}m {int(seconds)}s\n")
    f.write(f"Final BLEU score: {bleu.score:.2f}\n\n")
    for line in hypotheses:
        f.write(line + "\n")
