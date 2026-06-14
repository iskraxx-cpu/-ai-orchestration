"""Клиент Google Gemini для генерации и редактирования изображений.

Использует только стандартную библиотеку Python (urllib), без сторонних
зависимостей — поэтому работает сразу после `git clone`, без `pip install`.

Модель: gemini-2.5-flash-image ("Nano Banana") — умеет:
  * генерировать изображение по текстовому описанию;
  * редактировать поданное фото по инструкции;
  * комбинировать несколько изображений (вписывать предмет в сцену).
"""

from __future__ import annotations

import base64
import json
import mimetypes
import os
import time
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path

DEFAULT_MODEL = "gemini-2.5-flash-image"
API_ROOT = "https://generativelanguage.googleapis.com/v1beta"


class GeminiError(RuntimeError):
    """Ошибка обращения к Gemini API (сеть, авторизация, отказ модели)."""


@dataclass
class GeneratedImage:
    """Одно изображение, вернувшееся от модели."""

    data: bytes
    mime_type: str

    @property
    def extension(self) -> str:
        return mimetypes.guess_extension(self.mime_type) or ".png"


@dataclass
class GenerationResult:
    """Результат одного запроса: картинки + сопроводительный текст модели."""

    images: list[GeneratedImage]
    text: str


def resolve_api_key(explicit: str | None = None) -> str:
    """Берёт ключ из аргумента или переменных окружения.

    Поддерживаются GEMINI_API_KEY и GOOGLE_API_KEY.
    """
    key = explicit or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        raise GeminiError(
            "Не найден API-ключ. Задайте переменную окружения GEMINI_API_KEY "
            "(получить: https://aistudio.google.com/apikey) либо передайте --key."
        )
    return key


def _image_part(path: str | Path) -> dict:
    """Читает файл картинки и упаковывает его в inline-часть запроса."""
    p = Path(path)
    if not p.is_file():
        raise GeminiError(f"Файл не найден: {p}")
    mime, _ = mimetypes.guess_type(str(p))
    if mime is None or not mime.startswith("image/"):
        mime = "image/png"
    encoded = base64.b64encode(p.read_bytes()).decode("ascii")
    return {"inline_data": {"mime_type": mime, "data": encoded}}


def generate(
    prompt: str,
    *,
    input_images: list[str | Path] | None = None,
    api_key: str | None = None,
    model: str = DEFAULT_MODEL,
    aspect_ratio: str | None = None,
    timeout: int = 120,
    retries: int = 3,
) -> GenerationResult:
    """Делает один запрос к Gemini и возвращает изображения и текст.

    prompt          — текстовое описание/инструкция.
    input_images    — пути к входным изображениям (для правки/композиции).
    aspect_ratio    — например "16:9", "1:1", "9:16" (best-effort).
    """
    key = resolve_api_key(api_key)

    parts: list[dict] = []
    for img in input_images or []:
        parts.append(_image_part(img))
    parts.append({"text": prompt})

    body: dict = {
        "contents": [{"parts": parts}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
    }
    if aspect_ratio:
        body["generationConfig"]["imageConfig"] = {"aspectRatio": aspect_ratio}

    url = f"{API_ROOT}/models/{model}:generateContent"
    payload = json.dumps(body).encode("utf-8")

    last_err: Exception | None = None
    for attempt in range(retries):
        request = urllib.request.Request(
            url,
            data=payload,
            method="POST",
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": key,
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout) as resp:
                raw = json.loads(resp.read().decode("utf-8"))
            return _parse_response(raw)
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")
            # 4xx (кроме 429) — повтор не поможет, сразу падаем.
            if 400 <= exc.code < 500 and exc.code != 429:
                raise GeminiError(f"HTTP {exc.code}: {detail}") from exc
            last_err = GeminiError(f"HTTP {exc.code}: {detail}")
        except (urllib.error.URLError, TimeoutError) as exc:
            last_err = GeminiError(f"Сетевая ошибка: {exc}")

        if attempt < retries - 1:
            time.sleep(2 ** attempt)  # 1с, 2с, 4с...

    raise last_err or GeminiError("Не удалось выполнить запрос")


def _parse_response(raw: dict) -> GenerationResult:
    """Достаёт картинки и текст из ответа generateContent."""
    candidates = raw.get("candidates") or []
    if not candidates:
        feedback = raw.get("promptFeedback") or {}
        blocked = feedback.get("blockReason")
        if blocked:
            raise GeminiError(f"Запрос отклонён модерацией: {blocked}")
        raise GeminiError(f"Пустой ответ от модели: {json.dumps(raw)[:500]}")

    images: list[GeneratedImage] = []
    texts: list[str] = []
    for part in candidates[0].get("content", {}).get("parts", []):
        inline = part.get("inline_data") or part.get("inlineData")
        if inline and inline.get("data"):
            mime = inline.get("mime_type") or inline.get("mimeType") or "image/png"
            images.append(GeneratedImage(base64.b64decode(inline["data"]), mime))
        elif part.get("text"):
            texts.append(part["text"])

    if not images:
        msg = " ".join(texts).strip()
        raise GeminiError(
            "Модель не вернула изображение"
            + (f". Ответ: {msg}" if msg else " (попробуйте переформулировать запрос).")
        )

    return GenerationResult(images=images, text="\n".join(texts).strip())
