# bot/bot.py
import os
import sys
import asyncio
import django
from asgiref.sync import sync_to_async
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message

# === Настройка пути и Django ===
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TaskManager.settings')

try:
    django.setup()
    from backend.models import UserProfile
    DJANGO_AVAILABLE = True
    print("Django успешно инициализирован")
except Exception as e:
    print("WARNING: Не удалось инициализировать Django:", str(e))
    DJANGO_AVAILABLE = False

BOT_TOKEN = "8545864471:AAFujpb6x5-Yk9G1RFSHIQeNW7mFqU8ogYY"

if not BOT_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN не задан!")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


# === Синхронные функции для ORM (с select_related) ===

@sync_to_async
def get_profile_by_chat_id(chat_id):
    return UserProfile.objects.select_related('user').filter(telegram_chat_id=chat_id).first()

@sync_to_async
def get_profile_by_token(token):
    return UserProfile.objects.select_related('user').filter(telegram_token=token).first()

@sync_to_async
def save_profile(profile):
    profile.save()


# === Команды ===

@dp.message(Command("start"))
async def start_command(message: types.Message):
    await message.answer(
        "Привет! Я - бот TaskManager.\n\n"
        "Доступные команды:\n"
        "/link - привязать аккаунт по токену\n"
        "/show - показать привязанный аккаунт\n"
        "/unlink - отвязать аккаунт"
    )

@dp.message(Command("link"))
async def link_command(message: types.Message):
    if not DJANGO_AVAILABLE:
        await message.answer("Бот не подключён к базе данных.")
        return

    chat_id = str(message.chat.id)
    existing_profile = await get_profile_by_chat_id(chat_id)
    if existing_profile:
        await message.answer(
            f"Вы уже привязаны к аккаунту {existing_profile.user.username}.\n"
            "Сначала отвяжитесь с помощью /unlink, затем повторите попытку."
        )
    else:
        await message.answer(
            "Отправьте свой код-токен из профиля TaskManager.\n"
            "Пример: aBcDeFgH"
        )

@dp.message(Command("show"))
async def show_command(message: types.Message):
    if not DJANGO_AVAILABLE:
        await message.answer("Бот не подключён к базе данных.")
        return
    chat_id = str(message.chat.id)
    profile = await get_profile_by_chat_id(chat_id)
    if profile:
        await message.answer(f"Вы привязаны к аккаунту: {profile.user.username}")
    else:
        await message.answer("Вы не привязаны. Используйте /link")

@dp.message(Command("unlink"))
async def unlink_command(message: types.Message):
    if not DJANGO_AVAILABLE:
        await message.answer("Бот не подключён к базе данных.")
        return
    chat_id = str(message.chat.id)
    profile = await get_profile_by_chat_id(chat_id)
    if profile:
        profile.telegram_chat_id = None
        await save_profile(profile)
        await message.answer("Аккаунт отвязан.")
    else:
        await message.answer("Вы не привязаны.")

@dp.message()
async def handle_telegram_token(message: types.Message):
    if not DJANGO_AVAILABLE:
        return

    text = message.text.strip()
    if not text or len(text) < 4 or text.startswith('/'):
        return

    chat_id = str(message.chat.id)

    # Проверяем, не привязан ли уже этот чат
    existing_profile = await get_profile_by_chat_id(chat_id)
    if existing_profile:
        await message.answer(
            f"Вы уже привязаны к аккаунту {existing_profile.user.username}. "
            "Сначала отвяжитесь с помощью /unlink, затем повторите попытку."
        )
        return

    # Ищем профиль по токену
    profile = await get_profile_by_token(text)
    if not profile:
        await message.answer("Неверный токен.")
        return

    # Привязываем
    profile.telegram_chat_id = chat_id
    await save_profile(profile)
    await message.answer(
        f"Аккаунт {profile.user.username} успешно привязан!\n"
        "Теперь вы будете получать уведомления о задачах."
    )


# === Запуск ===
async def main():
    print("Бот Telegram запущен...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())