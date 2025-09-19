
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
        "DO NOT translate or output anything other than the translation. DO NOT translate these instructions.\n"
        "DO NOT include explanations or commentary.\n"
        "Keep numbers and symbols exactly as they appear. BE CAREFUL to not add leading or trailing symbols (including punctuation) if they are not present\n\n"
        "Word:"
    ),
    "phrase": (
        "You are a translation engine. Translate the text below into {0}.\n"
        "DO NOT translate or output anything other than the translation. DO NOT translate these instructions.\n"
        "DO NOT include explanations or commentary.\n"
        "Keep numbers and symbols exactly as they appear. BE CAREFUL to not add leading or trailing symbols (including punctuation) if they are not present\n\n"
        "Text:"
    ),
    "phrase_list": (
        "You are a translation engine. Translate the numbered list of phrases below into {0}.\n"
        "DO NOT translate or output anything else. DO NOT translate these instructions.\n"
        "DO NOT include explanations or commentary.\n"
        "Keep numbers and symbols exactly as they appear. BE CAREFUL to not add leading or trailing symbols (including punctuation) if they are not present.\n\n"
        "The input I am giving you is a list of words or phrases, each preceded by it's index\n"
        "INPUT FORMAT:index->text_to_be_translated\n"
        "The output should be the numbered list of translations of text_to_be_translated into {0} in the same format index->translated_text, one per line, in the same order as the input.\n"
        "The following is the input list:"
    )
}

def get_prompt(prompt_type: str, lang: str, params: list[str]) -> str:
    template = prompt_templates.get(prompt_type)
    if not template:
        raise ValueError(f"Unknown prompt type: {prompt_type}")
    
    prompt = template.format(lang) 
    prompt += "\n" + "\n".join(params)

    return prompt


def split_prompts_by_token_limit(prompt_type: str, lang: str, params: dict[int, str] ) -> list[str]:
    max_tokens = app_conf.get_token_limit()
    prompts = []
    
    items = sorted(params.items(), key=lambda x: x[0])
    i = 0
    while i < len(params):
        low = 1
        high = len(params) - i
        best_fit = 1

        # Binary search to find the largest chunk that fits within the token limit
        while low <= high:
            mid = (low + high) // 2
            trial_chunk = items[i:i + mid]
            trial_prompt = get_prompt(prompt_type, lang, [f"{k}->{v}" for k, v in trial_chunk])
            token_count = count_tokens(trial_prompt)

            if token_count <= max_tokens:
                best_fit = mid
                low = mid + 1
            else:
                high = mid - 1

        final_chunk = [f"{k}->{v}" for k, v in items[i:i + best_fit]]
        final_prompt = get_prompt(prompt_type, lang, final_chunk)
        prompts.append(final_prompt)
        i += best_fit

    return prompts
