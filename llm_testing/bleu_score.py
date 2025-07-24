import ollama
import sacrebleu
import time

MODEL = "gemma3:latest" # "llama3.2:3b" | "nous-hermes2:latest" | "mistral:latest" | "gemma3:latest" | "gemma3:4b-it-qat"

SOURCE_FILE = "europarl-v7.it-en.en"
REFERENCE_FILE = "europarl-v7.it-en.it"
OUTPUT_FILE = "generated_translations.it"  # File to save hypotheses

MAX_SENTENCES = 1000
BLEU_INTERVAL = 1000  # Interval to compute intermediate BLEU scores


with open(SOURCE_FILE, "r", encoding="utf-8") as f:
    source_sentences = [line.strip() for i, line in enumerate(f) if i < MAX_SENTENCES]

with open(REFERENCE_FILE, "r", encoding="utf-8") as f:
    references = [line.strip() for i, line in enumerate(f) if i < MAX_SENTENCES]

hypotheses = []

print(f"Generating translations for first {MAX_SENTENCES} sentences...")

start_time = time.time()

for i, sentence in enumerate(source_sentences):
    if i % 10 == 0:
        print(f"Translating sentence {i+1}/{len(source_sentences)}")

    prompt = f"Translate this sentence from English to Italian. Only return the Italian translation without any explanation, no labels, no commentary:\n\n{sentence}"

    response = ollama.generate(model=MODEL, prompt=prompt)
    translation = response['response'].strip()

    hypotheses.append(translation)

    # intemediate BLEU score
    # if (i + 1) % BLEU_INTERVAL == 0:
    #     bleu = sacrebleu.corpus_bleu(hypotheses, [references[:i+1]])
    #     print(f"Intermediate BLEU score after {i+1} sentences: {bleu.score:.2f}")
    #     with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    #         for line in hypotheses:
    #             f.write(line + "\n")

end_time = time.time()

total_time = end_time - start_time
minutes, seconds = divmod(total_time, 60)

print(f"Total time taken: {int(minutes)} minutes {int(seconds)} seconds")

# Final BLEU score
bleu = sacrebleu.corpus_bleu(hypotheses, [references])
print(f"\nFinal BLEU score after {MAX_SENTENCES} sentences: {bleu.score:.2f}")

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(f"Total time taken: {int(minutes)} minutes {int(seconds)} seconds\n")
    f.write(f"Final BLEU score after {MAX_SENTENCES} sentences: {bleu.score:.2f}\n")
    
    for line in hypotheses:
        f.write(line + "\n")