"""Тесты разбора ответа Gemini (без обращения к сети)."""

import base64
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from imagine.client import GeminiError, _parse_response  # noqa: E402


def _png_b64() -> str:
    # 1x1 прозрачный PNG.
    raw = bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
        "890000000a49444154789c6360000002000154a24f7f0000000049454e44ae426082"
    )
    return base64.b64encode(raw).decode()


class ParseResponseTests(unittest.TestCase):
    def test_extracts_image_and_text(self):
        raw = {
            "candidates": [{"content": {"parts": [
                {"text": "вот результат"},
                {"inline_data": {"mime_type": "image/png", "data": _png_b64()}},
            ]}}]
        }
        result = _parse_response(raw)
        self.assertEqual(len(result.images), 1)
        self.assertEqual(result.images[0].mime_type, "image/png")
        self.assertEqual(result.images[0].extension, ".png")
        self.assertEqual(result.text, "вот результат")

    def test_handles_camelcase_inlinedata(self):
        raw = {"candidates": [{"content": {"parts": [
            {"inlineData": {"mimeType": "image/jpeg", "data": _png_b64()}},
        ]}}]}
        result = _parse_response(raw)
        self.assertEqual(result.images[0].mime_type, "image/jpeg")

    def test_blocked_prompt_raises(self):
        raw = {"candidates": [], "promptFeedback": {"blockReason": "SAFETY"}}
        with self.assertRaises(GeminiError) as ctx:
            _parse_response(raw)
        self.assertIn("SAFETY", str(ctx.exception))

    def test_text_only_response_raises(self):
        raw = {"candidates": [{"content": {"parts": [{"text": "не могу"}]}}]}
        with self.assertRaises(GeminiError) as ctx:
            _parse_response(raw)
        self.assertIn("не вернула изображение", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
