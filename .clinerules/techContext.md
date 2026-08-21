# Technical Context — Quantum

## Стек технологий
- **Frontend / SSR:** React, TypeScript, React Router, MUI v9, TanStack Query, SSR, PWA, Leaflet (Карты).
- **Backend:** Node.js, Express, TypeScript.
- **Database:** MySQL.

## Структура монорепозитория
### Frontend
- `src/main.tsx` — Точка входа application.
- `src/App.tsx` — Конфигурация маршрутов (React Router).
- `src/pages/` — Страницы приложения.
- `src/features/` — Компоненты по доменам.
### Backend
- `src/router.ts` — Маршруты API .
- `src/controllers/` — Контроллеры запросов.
- `src/entities/` — Типы бэкенда (`*.db.ts` для моделей БД).
- `src/mappers/` — Мапперы сущностей.
- `src/repositories/` — Репозитории для работы с таблицами БД.
- `src/services/` — Сервисы бизнес-логики.
- `src/dto/index.ts` — Типы между фронтом и беком.

## Команды запуска и проверки
- Запуск application: `npm run dev`
- Запуск ssr: `npm run dev:ssr`
- Запуск backend: `npm run dev:backend`
- Проверка: `npm run check`
