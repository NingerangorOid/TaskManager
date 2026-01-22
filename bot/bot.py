# bot/bot.py
import os
import sys
import asyncio
import django
from asgiref.sync import sync_to_async
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message

# === 1. Добавляем корень проекта в PYTHONPATH ===
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# === 2. Настройка Django ===
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TaskManager.settings')

try:
    django.setup()
    from backend.models import UserProfile
    DJANGO_AVAILABLE = True
    print("Django успешно инициализирован")
except Exception as e:
    print("WARNING: Не удалось инициализировать Django:", str(e))
    DJANGO_AVAILABLE = False

# === 3. Токен бота ===
BOT_TOKEN = "8545864471:AAFujpb6x5-Yk9G1RFSHIQeNW7mFqU8ogYY"

if not BOT_TOKEN:
    raise ValueError("TELEGRAM_BOT_TOKEN не задан!")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# === 4. Команды бота ===

@dp.message(Command("start"))
async def start_command(message: types.Message):
    user = message.from_user
    await message.answer(
        f"Привет, {user.first_name}!\n"
        "Я — бот TaskManager.\n"
        "Чтобы привязать аккаунт, отправь мне свой токен из профиля.\n"
        "Если его нет — создай нового пользователя в админке.\n"
        f"Твой chat_id: {message.chat.id}"
    )

@dp.message(Command("link"))
async def link_command(message: types.Message):
    await message.answer(
        "Чтобы привязать аккаунт:\n"
        "1. Зайди в профиль в TaskManager\n"
        "2. Скопируй свой токен\n"
        "3. Отправь его мне как обычное сообщение (не команду)\n"
        "После этого я начну присылать уведомления о задачах!"
    )

@dp.message(Command("unlink"))
async def unlink_command(message: types.Message):
    if not DJANGO_AVAILABLE:
        await message.answer("Бот не подключён к базе данных.")
        return

    chat_id = str(message.chat.id)
    try:
        profile = await sync_to_async(
            lambda: UserProfile.objects.filter(telegram_chat_id=chat_id).first()
        )()

        if not profile:
            await message.answer("Вы не привязаны ни к одному аккаунту.")
            return

        profile.telegram_chat_id = None
        await sync_to_async(profile.save)()
        await message.answer("Аккаунт отвязан. Уведомления больше не будут приходить.")
    except Exception as e:
        await message.answer("Произошла ошибка. Попробуйте позже.")
        print("Ошибка отвязки:", str(e))

@dp.message()
async def handle_telegram_token(message: types.Message):
    if not DJANGO_AVAILABLE:
        return

    text = message.text.strip()
    if len(text) < 4 or ' ' in text:
        # Это не токен — игнорируем
        await message.answer("Не понял. Введите команду или токен.")
        return

    try:
        profile = await sync_to_async(
            lambda: UserProfile.objects.filter(telegram_token=text).first()
        )()

        if not profile:
            await message.answer(
                "Неверный токен.\n"
                "Проверьте, правильно ли скопировали токен из профиля."
            )
            return

        profile.telegram_chat_id = str(message.chat.id)
        await sync_to_async(profile.save)()
        await message.answer(
            "Аккаунт успешно привязан!\n"
            "Теперь вы будете получать уведомления о задачах."
        )
    except Exception as e:
        await message.answer("Произошла ошибка. Попробуйте позже.")
        print("Ошибка обработки токена:", str(e))

# === 5. Запуск бота ===
async def main():
    print("Бот Telegram запущен...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())