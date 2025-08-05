
import tiktoken

import app_conf



def count_tokens(text: str) -> int:
    """Counts the number of tokens in a string for a given model."""

    try:
        encoding = tiktoken.encoding_for_model(app_conf.model_name)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    
    return len(encoding.encode(text))