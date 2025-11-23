# Руководство по интеграции модели из Jupyter Notebook

Это руководство поможет интегрировать готовую модель и предобработку данных из Jupyter notebook в ML Service.

## Структура интеграции

### 1. Feature Engineering (`src/feature_engineering.py`)

Замените функцию `prepare_features()`:

```python
def prepare_features(stockpile_data: Dict[str, Any]) -> pd.DataFrame:
    """
    Вставьте ваш код предобработки из Jupyter notebook
    """
    # Ваш код здесь
    # ...
    return features_df
```

Также замените функцию `preprocess_data()` для обучения:

```python
def preprocess_data(raw_data: pd.DataFrame) -> pd.DataFrame:
    """
    Вставьте ваш код предобработки для обучения
    """
    # Ваш код здесь
    # ...
    return processed_data
```

### 2. Предсказания (`src/predictor.py`)

В классе `Predictor`, метод `predict()`:

```python
def predict(self, stockpile_data: Dict[str, Any], horizon_days: int = 7) -> Dict[str, Any]:
    # Подготовка признаков
    features_df = prepare_features(stockpile_data)
    
    # Использование модели для предсказания
    prediction = self.model_manager.current_model.predict(features_df)
    
    # Обработка результата
    # ...
    return prediction_result
```

### 3. Обучение модели (`src/trainer.py`)

В классе `Trainer`, метод `train_model()`:

```python
def train_model(self, model_name: str, model_version: str, config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    # Получение данных
    training_data = self.db.get_training_data()
    
    # Предобработка
    processed_data = preprocess_data(training_data)
    
    # Обучение модели (ваш код из notebook)
    model = train_xgboost_model(processed_data, config)
    
    # Сохранение модели
    model_path = self.model_manager.save_model(model, model_name, model_version)
    
    # Вычисление метрик
    metrics = calculate_metrics(model, processed_data)
    
    return {
        "success": True,
        "model_path": model_path,
        "metrics": metrics,
        # ...
    }
```

И замените функцию `train_xgboost_model()`:

```python
def train_xgboost_model(data: pd.DataFrame, config: Optional[Dict[str, Any]] = None) -> Any:
    """
    Вставьте ваш код обучения из Jupyter notebook
    """
    # Ваш код здесь
    # ...
    return trained_model
```

## Формат данных

### Входные данные для предсказания

`stockpile_data` - словарь с данными штабеля:
```python
{
    "shtabel_id": int,
    "sklad_id": int,
    "label": str,
    "mark": str,
    "formed_at": datetime,
    "mass_t": float,
    "current_mass": float,
    "last_temp": float,
    "last_temp_date": datetime,
    "status": str,
    "supplies": [...],  # История поставок
    "temperatures": [...],  # История температур
    "fires": [...],  # История пожаров
}
```

### Выходные данные предсказания

```python
{
    "shtabel_id": int,
    "model_name": str,
    "model_version": str,
    "predicted_date": str (ISO format),
    "prob_event": float (0-1),
    "risk_level": str ("LOW", "MEDIUM", "HIGH", "CRITICAL"),
    "horizon_days": int,
    "interval_low": str (ISO format),
    "interval_high": str (ISO format),
    "confidence": float (0-1),
    "meta": dict,
}
```

## Тестирование

После интеграции протестируйте:

1. **Health check**: `GET /health`
2. **Предсказание**: `POST /predict` с `{"shtabel_id": 1}`
3. **Обучение**: `POST /train` с параметрами модели

## Примеры

См. файлы с комментариями `# TODO: Integrate...` для мест, где нужно вставить ваш код.
