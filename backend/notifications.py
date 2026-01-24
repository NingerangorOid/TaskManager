# backend/notifications.py
import asyncio
import threading
from aiogram import Bot

BOT_TOKEN = "8545864471:AAFujpb6x5-Yk9G1RFSHIQeNW7mFqU8ogYY"
_bot_instance = None
_loop = None
_thread = None

def _start_event_loop(loop):
    """Запускает event loop в отдельном потоке"""
    asyncio.set_event_loop(loop)
    loop.run_forever()

def get_bot():
    global _bot_instance, _loop, _thread
    if _bot_instance is None:
        _bot_instance = Bot(token=BOT_TOKEN)
        _loop = asyncio.new_event_loop()
        _thread = threading.Thread(target=_start_event_loop, args=(_loop,), daemon=True)
        _thread.start()
    return _bot_instance

def send_telegram_notification(chat_id: str, message: str):
    """Вызывается из сигналов"""
    try:
        bot = get_bot()
        future = asyncio.run_coroutine_threadsafe(
            bot.send_message(chat_id=chat_id, text=message),
            _loop
        )
        result = future.result(timeout=10)
        return True
    except Exception as e:
        print("Error sending Telegram notification:", str(e))
        return False