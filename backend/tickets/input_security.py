"""Shared input normalization helpers for user-controlled text fields."""

from __future__ import annotations

import re
from collections.abc import Mapping


CONTROL_CHAR_RE = re.compile(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]')
ZERO_WIDTH_RE = re.compile(r'[\u200b-\u200d\ufeff]')
HTML_TAG_RE = re.compile(r'<[^>]*>')
WHITESPACE_RE = re.compile(r'\s+')


def clean_text(
    value,
    *,
    max_length: int | None = None,
    allow_newlines: bool = False,
    strip_tags: bool = True,
):
    """Normalize a string for safe storage.

    The helper trims surrounding whitespace, removes control/zero-width
    characters, and strips HTML tags by default so user input is stored as
    plain text.
    """

    if value is None:
        return ''

    text = str(value)
    text = ZERO_WIDTH_RE.sub('', text)
    text = CONTROL_CHAR_RE.sub('', text)
    if strip_tags:
        text = HTML_TAG_RE.sub('', text)
    text = text.strip()
    if not allow_newlines:
        text = WHITESPACE_RE.sub(' ', text)
    if max_length is not None:
        text = text[:max_length]
    return text


def clean_text_list(values, *, max_length: int | None = None, allow_newlines: bool = False):
    """Clean a list of free-text values and drop blanks."""

    if values is None:
        return []

    cleaned = []
    for value in values:
        text = clean_text(value, max_length=max_length, allow_newlines=allow_newlines)
        if text:
            cleaned.append(text)
    return cleaned


def sanitize_payload(data, field_rules: Mapping[str, dict]):
    """Return a copy of request/serializer data with selected fields cleaned."""

    if not field_rules:
        return data

    if hasattr(data, 'copy'):
        cleaned = data.copy()
    else:
        cleaned = dict(data)

    for field_name, options in field_rules.items():
        if field_name not in cleaned:
            continue
        value = cleaned[field_name]
        if isinstance(value, (list, tuple)):
            cleaned[field_name] = clean_text_list(value, **options)
        else:
            cleaned[field_name] = clean_text(value, **options)

    return cleaned