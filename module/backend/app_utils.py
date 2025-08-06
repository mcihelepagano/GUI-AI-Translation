
import tiktoken
import app_conf


def count_tokens(text: str) -> int:
    """Counts the number of tokens in a string for a given model."""

    try:
        encoding = tiktoken.encoding_for_model(app_conf.model_name)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    
    return len(encoding.encode(text))


prompt_templates = {
    "word": (
        "You are a translation engine. Translate the word below into {0}.\n"
        "Only translate the word between the delimiters.\n"
        "DO NOT translate or output anything else. DO NOT translate these instructions.\n"
        "DO NOT include explanations or commentary.\n"
        "Keep numbers and symbols exactly as they appear.\n\n"
        "Word:"
    ),
    "phrase": (
        "You are a translation engine. Translate the text below into {0}.\n"
        "Only translate the text between the delimiters.\n"
        "DO NOT translate or output anything else. DO NOT translate these instructions.\n"
        "DO NOT include explanations or commentary.\n"
        "Keep numbers and symbols exactly as they appear.\n\n"
        "Text:"
    ),
    "phrase_list": (
        "You are a translation engine. Translate the following list of texts to {0}."
        "If a text is already in {0}, return it exactly as-is. "
        "Do not explain, do not comment, and do not include any reasoning or metadata. "
        "The output should be a single string containing all original text translations, separated by new lines "
        "in the following format: original_text_1 ===== translated_text_1\noriginal_text_2 ===== translated_text_2\n"
        "Preserve all numerals and symbols exactly as they appear, DO NOT translate them into natural language. "
        "The following are the input texts separated by new lines:"
    )
}

def get_prompt(prompt_type: str, lang: str, params: list[str]) -> str:
    template = prompt_templates.get(prompt_type)
    if not template:
        raise ValueError(f"Unknown prompt type: {prompt_type}")
    
    prompt = template.format(lang) 
    prompt += "\n" + "\n".join(params)

    return prompt




def split_prompts_by_token_limit(prompt_type: str, lang: str, params: list[str] ) -> list[str]:
    max_tokens = app_conf.get_token_limit()
    prompts = []
    i = 0
    while i < len(params):
        low = 1
        high = len(params) - i

        best_fit = 1

        # Binary search to find the largest chunk that fits within the token limit
        while low <= high:
            mid = (low + high) // 2
            trial_chunk = params[i:i + mid]
            trial_prompt = get_prompt(prompt_type, lang, trial_chunk)
            token_count = count_tokens(trial_prompt)

            if token_count <= max_tokens:
                best_fit = mid
                low = mid + 1
            else:
                high = mid - 1

        final_chunk = params[i:i + best_fit]
        final_prompt = get_prompt(prompt_type, lang, final_chunk)
        prompts.append(final_prompt)
        i += best_fit

    return prompts
