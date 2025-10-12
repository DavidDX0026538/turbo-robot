# Функция для получения данных о погоде через альтернативный API
def get_weather_alternative(city: str):
    try:
        url = f"{ALTERNATIVE_API_URL}{city}?format=j1"
        logger.info(f"Trying alternative API: {url}")
        
        response = requests.get(url)
        response.raise_for_status()
        
        data = response.json()
        
        # Формируем ответ из данных wttr.in
        current = data.get('current_condition', [{}])[0]
        location = data.get('nearest_area', [{}])[0].get('areaName', [{}])[0].get('value', city)
        
        temp = current.get('temp_C', 'N/A')
        feels_like = current.get('FeelsLikeC', 'N/A')
        description = current.get('weatherDesc', [{}])[0].get('value', 'N/A')
        humidity = current.get('humidity', 'N/A')
        pressure = current.get('pressure', 'N/A')
        wind_speed = current.get('windspeedKmph', 'N/A')
        
        message = (
            f"🏙 Погода в {location}:\n\n"
            f"🌡 Температура: {temp}°C\n"
            f"🌡 Ощущается как: {feels_like}°C\n"
            f"☁️ Описание: {description}\n"
            f"💧 Влажность: {humidity}%\n"
            f"🌬 Скорость ветра: {wind_speed} км/ч\n"
            f"🧭 Атмосферное давление: {pressure} мбар"
        )
        
        return message
    except Exception as err:
        error_message = f"Error with alternative API: {err}"
        logger.error(error_message)
        return Noneimport os
import logging
import requests
import time
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Константы
TELEGRAM_TOKEN = " "  # Ваш токен без пробелов
WEATHER_API_KEY = "0a5e8cb7cca0305ba14f4810ca774ddf"  # Ваш API ключ OpenWeatherMap
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"

# Альтернативный API для погоды (бесплатный, без ключа)


# Функция для обработки команды /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "Привет! Я бот погоды. Отправь мне название города, и я покажу текущую погоду."
    )

# Функция для обработки команды /help
async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        "Просто отправь мне название города или населённого пункта, и я сообщу тебе о текущей погоде."
    )

# Функция для получения данных о погоде
def get_weather(city: str):
    # Проверим два способа запроса - с параметрами и с заголовками
    params = {
        'q': city,
        'units': 'metric',  # Метрическая система (температура в градусах Цельсия)
        'lang': 'ru'  # Русский язык для описания погоды
    }
    
    headers = {
        'x-api-key': WEATHER_API_KEY
    }
    
    # Также добавим appid в параметры
    params['appid'] = WEATHER_API_KEY
    
    # Отладочная информация
    logger.info(f"Sending request to {WEATHER_API_URL} with params: {params}")
    
    # Добавляем небольшую задержку перед запросом
    time.sleep(1)
    
    try:
        response = requests.get(WEATHER_API_URL, params=params, headers=headers)
        logger.info(f"Response status code: {response.status_code}")
        
        # Если статус не 200, выведем текст ответа для отладки
        if response.status_code != 200:
            logger.error(f"Error response: {response.text}")
            
        response.raise_for_status()  # Проверка на ошибки HTTP
        weather_data = response.json()
        
        # Отладочная информация о полученных данных
        logger.info(f"Weather data keys: {weather_data.keys()}")
        
        # Формирование ответа
        city_name = weather_data['name']
        temp = weather_data['main']['temp']
        feels_like = weather_data['main']['feels_like']
        description = weather_data['weather'][0]['description']
        humidity = weather_data['main']['humidity']
        pressure = weather_data['main']['pressure']
        wind_speed = weather_data['wind']['speed']
        
        message = (
            f"🏙 Погода в городе {city_name}:\n\n"
            f"🌡 Температура: {temp:.1f}°C\n"
            f"🌡 Ощущается как: {feels_like:.1f}°C\n"
            f"☁️ Описание: {description}\n"
            f"💧 Влажность: {humidity}%\n"
            f"🌬 Скорость ветра: {wind_speed} м/с\n"
            f"🧭 Атмосферное давление: {pressure} гПа"
        )
        
        return message
    
    except requests.exceptions.HTTPError as err:
        if response.status_code == 404:
            return "Город не найден. Пожалуйста, проверьте правильность написания."
        else:
            error_message = f"HTTP Error: {err}"
            logger.error(error_message)
            return f"Произошла ошибка при получении данных о погоде. Детали: {error_message}"
    
    except Exception as err:
        error_message = f"Error: {err}"
        logger.error(error_message)
        return f"Произошла ошибка при обработке запроса. Детали: {error_message}"

# Обработчик сообщений с текстом (названием города)
async def handle_city(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    city = update.message.text
    
    # Отправляем "печатает..." статус
    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")
    
    # Сначала пробуем основной API
    weather_info = get_weather(city)
    
    # Если в ответе содержится "Произошла ошибка", пробуем альтернативный API
    if "Произошла ошибка" in weather_info:
        logger.info("Main API failed, trying alternative API")
        alt_weather_info = get_weather_alternative(city)
        if alt_weather_info:
            weather_info = alt_weather_info
    
    await update.message.reply_text(weather_info)

def main() -> None:
    # Создаем экземпляр приложения
    application = Application.builder().token(TELEGRAM_TOKEN).build()

    # Добавляем обработчики
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_city))

    # Запускаем бота
    application.run_polling()

if __name__ == "__main__":

    main()
