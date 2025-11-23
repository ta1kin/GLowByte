# ML Service - Coal Fire Predictor

Machine Learning service for predicting coal self-ignition.

## Структура

```
ml-service/
├── src/
│   ├── main.py                 # FastAPI приложение
│   ├── config.py               # Конфигурация
│   ├── database.py             # Подключение к БД и запросы
│   ├── model_manager.py        # Управление моделями (загрузка/сохранение)
│   ├── feature_engineering.py  # Feature engineering (заглушка для интеграции)
│   ├── predictor.py            # Логика предсказаний (заглушка для модели)
│   └── trainer.py              # Обучение модели (заглушка для интеграции)
├── models/                     # Директория для сохранения моделей
├── Dockerfile
├── requirements.txt
└── README.md
```

## Интеграция модели из Jupyter Notebook

### 1. Feature Engineering

Замените функцию `prepare_features()` в `src/feature_engineering.py`:

```python
def prepare_features(stockpile_data: Dict[str, Any]) -> pd.DataFrame:
    # Вставьте ваш код предобработки из Jupyter notebook
    # ...
    return features_df
```

### 2. Модель для предсказаний

В `src/predictor.py` в методе `predict()`:

```python
# Замените placeholder на использование реальной модели
prediction = self.model_manager.current_model.predict(features_df)
```

### 3. Обучение модели

В `src/trainer.py` в методе `train_model()`:

```python
# Вставьте ваш код обучения из Jupyter notebook
model = train_xgboost_model(processed_data, config)
```

## API Endpoints

- `GET /health` - Health check
- `POST /predict` - Предсказание для одного штабеля
- `POST /predict/batch` - Пакетное предсказание
- `POST /train` - Обучение модели
- `GET /metrics` - Метрики модели
- `POST /model/load` - Загрузка модели
- `GET /model/info` - Информация о загруженной модели

## Использование

### Локальный запуск

```bash
cd ml-service
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000
```

### Docker

```bash
docker-compose up ml-service
```

## Переменные окружения

См. `.env.example`:
- `DATABASE_URL` - URL подключения к PostgreSQL
- `MODEL_PATH` - Путь для сохранения моделей
- `MODEL_VERSION` - Версия модели по умолчанию
- `API_URL` - URL API сервиса

