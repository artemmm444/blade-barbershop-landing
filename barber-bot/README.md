# BLADE & CO. — Telegram-бот записи

Бот для барбершопа: клиент выбирает услугу, оставляет имя и телефон — заявка
мгновенно прилетает владельцу в личные сообщения. Написан на Python + aiogram 3.

## Что умеет

- `/start` — каталог услуг с ценами, запись в несколько нажатий
- `/help` — справка и прайс
- Кнопка «Отправить номер» (или ввод телефона вручную)
- Уведомление о заявке владельцу: услуга, имя, контакт, @username

---

## Установка (5 минут)

### 1. Получить токен у @BotFather

1. В Telegram открой [@BotFather](https://t.me/BotFather)
2. Отправь `/newbot`
3. Введи имя бота (например `BLADE & CO. Запись`)
4. Введи username — должен заканчиваться на `bot` (например `blade_co_booking_bot`)
5. BotFather пришлёт **токен** вида `123456789:AAF...` — скопируй его

### 2. Узнать свой OWNER_CHAT_ID

Это ID, куда бот шлёт заявки (твой личный чат).

1. Открой [@userinfobot](https://t.me/userinfobot) в Telegram
2. Нажми `/start`
3. Он пришлёт твой `Id` — это число (например `987654321`)

> Чтобы бот смог тебе написать, один раз нажми `/start` уже **в своём боте**.

### 3. Настроить `.env`

Скопируй пример и впиши значения:

```bash
cp .env.example .env
```

Открой `.env` и заполни:

```
BOT_TOKEN=123456789:AAF...        # токен от BotFather
OWNER_CHAT_ID=987654321           # твой Id от userinfobot
```

### 4. Установить зависимости и запустить

```bash
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python bot.py
```

В логах появится `Start polling` — бот работает. Открой его в Telegram, нажми
`/start`, пройди запись — заявка придёт тебе в личку.

---

## Деплой 24/7 (Render / Railway)

Бот работает через long polling — не нужен домен и вебхуки. Подойдёт любой
хостинг с постоянно запущенным процессом.

### Render (бесплатный Background Worker)

1. Залей папку `barber-bot` в отдельный репозиторий на GitHub
2. На [render.com](https://render.com) → **New** → **Background Worker**
3. Подключи репозиторий
4. Настройки:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python bot.py`
5. Вкладка **Environment** → добавь переменные:
   - `BOT_TOKEN` = токен от BotFather
   - `OWNER_CHAT_ID` = твой Id
6. **Create Worker** — через минуту бот в сети

### Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Выбери репозиторий
3. **Variables** → добавь `BOT_TOKEN` и `OWNER_CHAT_ID`
4. Start Command (если не подхватился): `python bot.py`
5. Deploy

> `.env` в репозиторий **не коммитим** — он в `.gitignore`. Секреты задаются
> через переменные окружения на хостинге.

---

## Настройка под себя

- **Услуги и цены** — список `SERVICES` в начале `bot.py`
- **Название** — переменная `BRAND`
- Тексты сообщений — прямо в обработчиках

## Структура

```
barber-bot/
├── bot.py             # вся логика бота
├── requirements.txt   # зависимости
├── .env.example       # шаблон переменных
└── README.md
```
