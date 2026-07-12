# Lead Landing — лендинг + Telegram-уведомления о заявках

Демо-лендинг (барбершоп) со формой заявки. Заявки приходят тебе в Telegram.
Статика (`index.html` / `styles.css` / `main.js` / `config.js`) + одна
Netlify Function `netlify/functions/lead.js` (замаплена на `/api/lead`).

## Как запустить и задеплоить

### 1. Создай Telegram-бота
1. В Telegram открой **@BotFather** → `/newbot` → задай имя → получи **токен**
   вида `123456789:AA...`.
2. Напиши своему новому боту любое сообщение (например «привет»).
3. Открой в браузере: `https://api.telegram.org/bot<ТОКЕН>/getUpdates`
   Найди `"chat":{"id":...}` — это твой **chat_id**.

### 2. Локальный запуск
```bash
npm i -g netlify-cli      # если ещё не стоит
cp .env.example .env      # впиши свои TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID
netlify dev                # откроется http://localhost:8888
```
Заполни форму → в Telegram должно прийти сообщение с заявкой.

> Просто открыть `index.html` файлом (`file://`) — форма работать не будет:
> нужен запущенный `/api/lead`. Используй `netlify dev`.

### 3. Деплой (живая ссылка)
```bash
netlify login
netlify deploy --prod      # выдаст https://...netlify.app
```
После деплоя добавь переменные окружения в проекте Netlify:
**Site configuration → Environment variables** → `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_CHAT_ID` (либо `netlify env:set TELEGRAM_BOT_TOKEN ...`).
Затем передеплой: `netlify deploy --prod`.

## Перекраска под нового клиента

Правишь **только `config.js`**: `brand`, `tagline`, `hero`, `accent` (цвет),
`services`, `reviews`, `contacts`. Всё остальное подтянется само.
Меняешь `accent` — меняется весь тон сайта. 1 файл = новый экспонат портфолио.

## Безопасность
- Токен бота — только в env, никогда в клиентском JS.
- `.env` в `.gitignore`, в git не попадает.
- `// ponytail:` в `netlify/functions/lead.js` — нет rate-limit; добавить
  капчу/лимит по IP, если пойдёт спам.
