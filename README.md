# AI Orchestration — Remotion Video

Видео-проект на [Remotion](https://remotion.dev) — программная генерация видео на React.

## Установка

```bash
npm install
```

> Remotion рендерит видео через headless Chrome. На Linux могут понадобиться
> системные библиотеки — см. https://remotion.dev/docs/miscellaneous/linux-dependencies

## Команды

| Команда | Описание |
| --- | --- |
| `npm run dev` | Запустить Remotion Studio (превью в браузере) |
| `npm run render` | Отрендерить видео в файл |
| `npm run upgrade` | Обновить Remotion до новой версии |
| `npm run lint` | Проверка типов TypeScript |

## Рендер примера

```bash
npx remotion render HelloWorld out/video.mp4
```

## Структура

- `src/index.ts` — точка входа, регистрирует корень (`registerRoot`)
- `src/Root.tsx` — список композиций (`<Composition>`)
- `src/HelloWorld.tsx` — пример анимированной композиции
- `remotion.config.ts` — конфигурация рендера
