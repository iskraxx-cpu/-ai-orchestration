"""Командный интерфейс imagine.

Подкоманды:
  gen      — сгенерировать изображение по текстовому описанию;
  edit     — отредактировать одно фото по инструкции;
  compose  — вписать предмет(ы) в сцену, комбинируя несколько изображений.
"""

from __future__ import annotations

import argparse
import datetime as dt
import os
import sys
from pathlib import Path

from . import __version__
from .client import GenerationResult, GeminiError, generate


def _load_dotenv(path: str = ".env") -> None:
    """Минимальный загрузчик .env (KEY=VALUE), без сторонних зависимостей.

    Уже заданные переменные окружения не перезаписываются.
    """
    p = Path(path)
    if not p.is_file():
        return
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def _save_images(result: GenerationResult, out_dir: Path, stem: str) -> list[Path]:
    """Сохраняет картинки результата в out_dir с понятными именами."""
    out_dir.mkdir(parents=True, exist_ok=True)
    ts = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    saved: list[Path] = []
    for i, img in enumerate(result.images):
        suffix = f"-{i + 1}" if len(result.images) > 1 else ""
        path = out_dir / f"{stem}-{ts}{suffix}{img.extension}"
        path.write_bytes(img.data)
        saved.append(path)
    return saved


def _run(prompt, *, inputs, args, stem) -> int:
    """Общий цикл выполнения для всех подкоманд."""
    out_dir = Path(args.out)
    all_saved: list[Path] = []
    try:
        for n in range(args.n):
            if args.n > 1:
                print(f"… вариант {n + 1}/{args.n}", file=sys.stderr)
            result = generate(
                prompt,
                input_images=inputs,
                api_key=args.key,
                model=args.model,
                aspect_ratio=args.aspect,
            )
            saved = _save_images(result, out_dir, stem)
            all_saved.extend(saved)
            if result.text:
                print(result.text, file=sys.stderr)
    except GeminiError as exc:
        print(f"Ошибка: {exc}", file=sys.stderr)
        return 1

    print("Готово, сохранено:")
    for p in all_saved:
        print(f"  {p}")
    return 0


def _cmd_gen(args) -> int:
    return _run(args.prompt, inputs=[], args=args, stem="gen")


def _cmd_edit(args) -> int:
    return _run(args.prompt, inputs=[args.image], args=args, stem="edit")


def _cmd_compose(args) -> int:
    if len(args.images) < 2:
        print("Ошибка: для compose нужно минимум 2 изображения "
              "(например, сцена + предмет).", file=sys.stderr)
        return 1
    return _run(args.prompt, inputs=args.images, args=args, stem="compose")


def _add_common(p: argparse.ArgumentParser) -> None:
    p.add_argument("--out", default="outputs", help="папка для результатов (по умолчанию: outputs)")
    p.add_argument("--n", type=int, default=1, help="сколько вариантов сгенерировать")
    p.add_argument("--aspect", default=None,
                   help="соотношение сторон, напр. 1:1, 16:9, 9:16")
    p.add_argument("--model", default="gemini-2.5-flash-image", help="модель Gemini")
    p.add_argument("--key", default=None,
                   help="API-ключ (иначе берётся из GEMINI_API_KEY / GOOGLE_API_KEY)")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="imagine",
        description="Генерация и редактирование изображений через Google Gemini.",
    )
    parser.add_argument("--version", action="version", version=f"imagine {__version__}")
    sub = parser.add_subparsers(dest="command", required=True)

    g = sub.add_parser("gen", help="сгенерировать картинку по описанию")
    g.add_argument("prompt", help="текстовое описание желаемого изображения")
    _add_common(g)
    g.set_defaults(func=_cmd_gen)

    e = sub.add_parser("edit", help="отредактировать фото по инструкции")
    e.add_argument("image", help="путь к исходному изображению")
    e.add_argument("prompt", help="что изменить (напр. 'сделай фон закатным')")
    _add_common(e)
    e.set_defaults(func=_cmd_edit)

    c = sub.add_parser("compose", help="вписать предмет(ы) в сцену из нескольких фото")
    c.add_argument("images", nargs="+", help="2+ изображений: сцена и предмет(ы)")
    c.add_argument("--prompt", required=True,
                   help="инструкция, напр. 'размести диван с фото-2 в комнате с фото-1'")
    _add_common(c)
    c.set_defaults(func=_cmd_compose)

    return parser


def main(argv: list[str] | None = None) -> int:
    _load_dotenv()
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
