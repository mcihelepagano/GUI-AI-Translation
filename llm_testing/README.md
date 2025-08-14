dataset files are compressed in the tgz.

each "x-generated_translation.it" file contains the time taken by llm "x", the obtained BLEU score and all translated sentences.

table for 1000 sentences generation:

| Model                | BLEU score | Time Taken |
|----------------------|------------|------------|
| gemma3_4b-it-qat     | 19.73      | 15 m 2 s   |
| gemma3:4b            | 19.69      | 10 m 57 s  |
| nous-hermes2:10.7b   | 17.30      | 36 m 4 s   |
| llama3.2:3b          | 14.80      | 9 m 47 s   |
| mistral:7b           | 10.17      | 26 m 5 s   |
| tinyllama_1.1b_chat_v0.6_fp16 | 3.47 | 12 m 35 s |