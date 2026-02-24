import re
from django.contrib.postgres.search import SearchQuery
from typing import Optional

def build_prefix_tsquery(text: str) -> Optional[SearchQuery]:
    """Преобразует входной текст в поисковый запрос для полнотекстового поиска с поддержкой префиксов."""
    tokens = re.findall(r"\w+", text, flags=re.UNICODE)
    if not tokens:
        return None

    raw_query = " & ".join(f"{token}:*" for token in tokens)
    return SearchQuery(raw_query, search_type="raw")
