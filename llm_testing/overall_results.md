#BLEU SCORE and TIME TAKEN

each "x-generated_translation.lang" file contains the time taken by llm "x" to translate from english to language "lang", the calculated BLEU score and all translated sentences.

##en-it:

| Model                | BLEU score | Time Taken   |
|----------------------|------------|--------------|
| gemma3_4b-it-qat     | 19.73      | 15 m 2 s     |
| gemma3:4b            | 19.69      | 10 m 57 s    |
| nous-hermes2:10.7b   | 17.30      | 36 m 4 s     |
| llama3.2:3b          | 14.80      | 9 m 47 s     |
| mistral:7b           | 10.17      | 26 m 5 s     |
| tinyllama_1.1b_chat_v0.6_fp16 | 3.47 | 12 m 35 s |

##en-fr:

| Model                | BLEU score | Time Taken   |
|----------------------|------------|--------------|
| gemma3_4b-it-qat     | 28.96      | 12 m 17 s    |
| gemma3:4b            | 28.90      | 10 m 44 s    |
| nous-hermes2:10.7b   | 27.48      | 25 m 1 s     |
| llama3.2:3b          | 23.18      | 9 m 11 s     |
| mistral:7b           | 23.04      | 24 m 34 s    |
| tinyllama_1.1b_chat_v0.6_fp16 | 6.47 | 10 m 59 s |

##en-de:

| Model                | BLEU score | Time Taken   |
|----------------------|------------|--------------|
| gemma3_4b-it-qat     | 17.18      | 11 m 46 s    |
| gemma3:4b            | 17.18      | 10 m 15 s    |
| nous-hermes2:10.7b   | 16.97      | 30 m 34 s    |
| llama3.2:3b          | 12.87      | 9 m 27 s     |
| mistral:7b           | 13.00      | 27 m 45 s    |
| tinyllama_1.1b_chat_v0.6_fp16 | 3.08 | 10 m 42 s |

<br>

***

<br>

#HUGGING FACE and OLLAMA COMPARISON

testing was done using the model tinyllama-1.1b-chat-v0.6 
| framework            | language | BLEU score | Time Taken   |
|----------------------|----------|------------|--------------|
| ollama               | italian  | 3.47       | 12 m 35 s    |
|                      | french   | 6.47       | 10 m 59 s    |
|                      | german   | 3.08       | 10 m 42 s    |
| huggingface          | italian  | 5.41       | 15m 49s      |
|                      | french   | 10.90      | 15m 14s      |
|                      | german   | 5.30       | 15m 24s      |