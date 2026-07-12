import asyncio
import logging
import os

from aiogram import Bot, Dispatcher, F, Router
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    CallbackQuery,
    ReplyKeyboardMarkup,
    ReplyKeyboardRemove,
    KeyboardButton,
    BotCommand,
)
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.environ["BOT_TOKEN"]
OWNER_CHAT_ID = os.environ["OWNER_CHAT_ID"]

BRAND = "BLADE & CO."

SERVICES = [
    {"name": "Мужская стрижка", "price": "1500 ₽", "time": "45 мин"},
    {"name": "Стрижка + борода", "price": "2200 ₽", "time": "60 мин"},
    {"name": "Оформление бороды", "price": "900 ₽", "time": "30 мин"},
    {"name": "Королевское бритьё", "price": "1300 ₽", "time": "40 мин"},
    {"name": "Детская стрижка", "price": "1000 ₽", "time": "30 мин"},
    {"name": "Камуфляж седины", "price": "1100 ₽", "time": "40 мин"},
]

router = Router()


class Booking(StatesGroup):
    name = State()
    contact = State()


def services_keyboard() -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(text=f"{s['name']} — {s['price']}", callback_data=f"svc:{i}")]
        for i, s in enumerate(SERVICES)
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def contact_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="Отправить номер", request_contact=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


@router.message(CommandStart())
async def start(message: Message) -> None:
    text = (
        f"<b>{BRAND}</b>\n"
        "Мужская стрижка, борода, королевское бритьё.\n\n"
        "Выбери услугу, чтобы записаться:"
    )
    await message.answer(text, reply_markup=services_keyboard())


@router.message(Command("help"))
async def help_command(message: Message) -> None:
    lines = [f"<b>{BRAND}</b> — запись онлайн", "", "Команды:", "/start — выбрать услугу и записаться", "/help — эта справка", "", "Услуги и цены:"]
    lines += [f"• {s['name']} — {s['price']} ({s['time']})" for s in SERVICES]
    lines += ["", "Нажми /start, выбери услугу, оставь имя и номер — мастер перезвонит."]
    await message.answer("\n".join(lines))


@router.callback_query(F.data.startswith("svc:"))
async def pick_service(callback: CallbackQuery, state: FSMContext) -> None:
    idx = int(callback.data.split(":")[1])
    service = SERVICES[idx]
    await state.update_data(service=service)
    await state.set_state(Booking.name)
    await callback.message.answer(
        f"Выбрано: <b>{service['name']}</b> ({service['price']}, {service['time']})\n\n"
        "Как к вам обращаться?",
        reply_markup=ReplyKeyboardRemove(),
    )
    await callback.answer()


@router.message(Booking.name)
async def get_name(message: Message, state: FSMContext) -> None:
    name = (message.text or "").strip()
    if not name:
        await message.answer("Напиши имя текстом.")
        return
    await state.update_data(name=name)
    await state.set_state(Booking.contact)
    await message.answer(
        "Оставь номер телефона — кнопкой ниже или просто напиши.",
        reply_markup=contact_keyboard(),
    )


@router.message(Booking.contact)
async def get_contact(message: Message, state: FSMContext, bot: Bot) -> None:
    contact = message.contact.phone_number if message.contact else (message.text or "").strip()
    if not contact:
        await message.answer("Пришли номер телефона или напиши его текстом.")
        return

    data = await state.get_data()
    service = data["service"]
    name = data["name"]
    user = message.from_user
    username_line = f"🔗 <b>Telegram:</b> @{user.username}" if user.username else "🔗 <b>Telegram:</b> без username"

    notify = (
        f"🔔 <b>Новая заявка из бота</b>\n\n"
        f"💈 <b>Услуга:</b> {service['name']} ({service['price']})\n"
        f"👤 <b>Имя:</b> {name}\n"
        f"📱 <b>Контакт:</b> {contact}\n"
        f"{username_line}"
    )
    await bot.send_message(OWNER_CHAT_ID, notify)

    await message.answer(
        "Заявка отправлена! Скоро свяжемся, чтобы подтвердить время. 💈",
        reply_markup=ReplyKeyboardRemove(),
    )
    await state.clear()


async def main() -> None:
    logging.basicConfig(level=logging.INFO)
    bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_router(router)
    await bot.set_my_commands([
        BotCommand(command="start", description="Записаться на услугу"),
        BotCommand(command="help", description="Справка и цены"),
    ])
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
