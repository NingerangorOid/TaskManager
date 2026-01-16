# backend/bot.py
import os
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import Message

# Настройка Django (для доступа к моделям)
try:
    from django.conf import settings
    from django.core.wsgi import get_wsgi_application
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TaskManager.settings')
    application = get_wsgi_application()
    from backend.models import TelegramSubscription
    DJANGO_AVAILABLE = True
except Exception:
    DJANGO_AVAILABLE = False


# Получаем токен из настроек или .env
def get_bot_token():
    if DJANGO_AVAILABLE:
        return getattr(settings, 'TELEGRAM_BOT_TOKEN', None)
    return os.getenv('TELEGRAM_BOT_TOKEN')


# Инициализация бота
bot = None
dp = None

def get_bot_instance():
    global bot, dp
    if bot is None:
        token = get_bot_token()
        if not token:
            raise ValueError("TELEGRAM_BOT_TOKEN не задан в settings.py или .env")
        bot = Bot(token=token)
        dp = Dispatcher()
        # Регистрируем команду /start
        dp.message.register(start_command, Command("start"))
    return bot, dp


async def start_command(message: types.Message):
    """Обработка команды /start"""
    user = message.from_user
    chat_id = str(message.chat.id)
    await message.answer(
        f"Привет, {user.first_name}!\n"
        f"Твой chat_id: {chat_id}\n"
        "Скопируй его и введи в профиле TaskManager."
    )


# === ФУНКЦИЯ ДЛЯ УВЕДОМЛЕНИЙ ИЗ DRF/SIGNALS ===
def notify_user_about_task(user_id: int, message: str):
    """
    Вызывается из signals.py или views.py.
    Отправляет уведомление пользователю в Telegram.
    """
    if not DJANGO_AVAILABLE:
        print("Django не доступен — уведомление не отправлено")
        return False

    try:
        sub = TelegramSubscription.objects.get(user_id=user_id)
        bot, _ = get_bot_instance()

        # Запускаем асинхронную отправку в синхронном контексте
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        success = loop.run_until_complete(bot.send_message(chat_id=sub.telegram_chat_id, text=message))
        loop.close()
        return True
    except TelegramSubscription.DoesNotExist:
        return False  # Пользователь не подписан
    except Exception as e:
        print(f"Ошибка отправки уведомления: {e}")
        return False


# === ЗАПУСК БОТА (только отдельно!) ===
async def run_bot():
    """Запуск бота в режиме polling"""
    token = get_bot_token()
    if not token:
        print("Ошибка: TELEGRAM_BOT_TOKEN не задан!")
        return

    bot, dp = get_bot_instance()
    print("Telegram-бот на aiogram запущен...")
    await dp.start_polling(bot)


# === Точка входа для запуска отдельно ===
if __name__ == "__main__":
    asyncio.run(run_bot())