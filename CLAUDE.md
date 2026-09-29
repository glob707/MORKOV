# MARKVI

Плагин BetterDiscord: динамическая стереопанорама участников голосового звонка. Полное описание, архитектура, ADR и план по слайсам — [docs/PROJECT_DEFINITION.md](docs/PROJECT_DEFINITION.md).

## Стек
TypeScript → esbuild → один `MARKVI.plugin.js`; vitest; ESLint; GitHub Actions. Runtime-зависимостей нет.

## Правила
- Ядро (`LayoutEngine`, `Positions`, `PanLaw`) не импортирует ничего из Discord/BetterDiscord, время передаётся параметром.
- Никаких сетевых вызовов в коде плагина.
- При любой ошибке — сброс панорамы в центр, а не частичная работа.

## Команды
- `npm run ci` — всё, что проверяет CI: типы, линтер, тесты, сборка, проверка бандла (сеть, мета-заголовок, зависимости)
- `npm run deploy` — собрать и положить в папку плагинов BetterDiscord
- `npm test` — юнит-тесты (только `test/`; `.claude/` исключён из тестов и линта)

Логи плагина — консоль Discord (Cmd+Option+I), префикс `[MARKVI]`.
