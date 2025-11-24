"""
FastAPI application for ML Service
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import logging
from datetime import datetime, timedelta

# Import our modules
from src.config import settings
from src.database import DatabaseService, SessionLocal
from src.model_manager import model_manager
from src.predictor import predictor
from src.trainer import trainer
from src.validator import validator
from src.csv_predictor import csv_predictor
from sqlalchemy import text

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Coal Fire Predictor ML Service",
    description="Machine Learning service for predicting coal self-ignition",
    version="1.0.0",
)

# CORS - разрешаем все origins для валидации и других операций
# В production можно ограничить конкретными доменами
import os
cors_origins = os.getenv("CORS_ORIGINS", "*")
if cors_origins == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
db_service = DatabaseService()


# ============================================
# Request/Response Models
# ============================================

class PredictionRequest(BaseModel):
    shtabel_id: int
    horizon_days: Optional[int] = 7


class DirectPredictionRequest(BaseModel):
    """Запрос на прогнозирование с прямыми параметрами из формы клиента"""
    max_temp: float  # Максимальная температура штабеля
    age_days: float  # Возраст штабеля в днях
    temp_air: Optional[float] = 20.0  # Температура воздуха
    humidity: Optional[float] = 60.0  # Влажность
    precip: Optional[float] = 0.0  # Осадки
    temp_delta_3d: Optional[float] = 0.0  # Изменение температуры за 3 дня
    horizon_days: Optional[int] = 7


class BatchPredictionRequest(BaseModel):
    shtabel_ids: List[int]
    horizon_days: Optional[int] = 7


class PredictionResponse(BaseModel):
    shtabel_id: int
    model_name: str
    model_version: Optional[str] = None
    predicted_date: Optional[str] = None
    prob_event: Optional[float] = None
    risk_level: str
    horizon_days: int = 7
    interval_low: Optional[str] = None
    interval_high: Optional[str] = None
    confidence: Optional[float] = None
    meta: Optional[dict] = None


class TrainRequest(BaseModel):
    model_name: str
    model_version: str
    config: Optional[Dict[str, Any]] = None


class TrainResponse(BaseModel):
    success: bool
    model_path: Optional[str] = None
    file_size: Optional[int] = None
    hyperparams: Optional[Dict[str, Any]] = None
    train_metrics: Optional[Dict[str, Any]] = None
    val_metrics: Optional[Dict[str, Any]] = None
    test_metrics: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, Any]] = None
    meta: Optional[Dict[str, Any]] = None


class ValidateResponse(BaseModel):
    success: bool
    metrics: Optional[Dict[str, Any]] = None
    model_info: Optional[Dict[str, Any]] = None
    validation_date: Optional[str] = None


class CSVPredictionResponse(BaseModel):
    success: bool
    predictions: List[Dict[str, Any]]
    statistics: Optional[Dict[str, Any]] = None
    model_info: Optional[Dict[str, Any]] = None
    prediction_date: Optional[str] = None


# ============================================
# Health Check
# ============================================

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    Checks database connection and model status
    """
    try:
        # Check database connection
        db_status = "connected"
        try:
            # Simple query to check DB connection
            with SessionLocal() as session:
                session.execute(text("SELECT 1"))
        except Exception as e:
            db_status = f"disconnected: {str(e)}"
            logger.warning(f"Database health check failed: {e}")
        
        # Check model status
        model_info = model_manager.get_model_info()
        model_status = "loaded" if model_manager.is_model_loaded() else "not_loaded"
        
        return {
            "status": "healthy" if db_status == "connected" else "degraded",
            "service": "ml-service",
            "version": "1.0.0",
            "database": db_status,
            "model": {
                "status": model_status,
                "info": model_info if model_info else None,
            },
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"Health check error: {e}", exc_info=True)
        return {
            "status": "unhealthy",
            "service": "ml-service",
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }


# ============================================
# Prediction Endpoints
# ============================================

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Predict fire date for a single stockpile
    
    Args:
        request: Prediction request with shtabel_id and optional horizon_days
        
    Returns:
        Prediction response with risk level, predicted date, and confidence
    """
    try:
        logger.info(f"Prediction request for shtabel {request.shtabel_id}")
        
        # Get stockpile data from database
        stockpile_data = db_service.get_stockpile_data(request.shtabel_id)
        
        if not stockpile_data:
            raise HTTPException(
                status_code=404,
                detail=f"Stockpile {request.shtabel_id} not found"
            )
        
        # Make prediction
        prediction_result = predictor.predict(
            stockpile_data,
            horizon_days=request.horizon_days or 7,
        )
        
        logger.info(
            f"Prediction completed for shtabel {request.shtabel_id}: "
            f"risk={prediction_result['risk_level']}"
        )
        
        return PredictionResponse(**prediction_result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


def _get_placeholder_prediction(request: DirectPredictionRequest) -> PredictionResponse:
    """
    Placeholder prediction when model is not available
    Uses simple heuristics based on temperature and age
    """
    target_date = datetime.now()
    max_temp = request.max_temp
    age_days = request.age_days or 0
    
    # Calculate risk level based on temperature and age
    if max_temp >= 80:
        risk_level = "CRITICAL"
        prob_event = 0.9
        days_to_fire = max(1, int(7 * 0.1))
    elif max_temp >= 60:
        risk_level = "HIGH"
        prob_event = 0.7
        days_to_fire = max(2, int(7 * 0.3))
    elif max_temp >= 40:
        risk_level = "MEDIUM"
        prob_event = 0.5
        days_to_fire = max(3, int(7 * 0.5))
    else:
        risk_level = "LOW"
        prob_event = 0.2
        days_to_fire = None
    
    horizon_days = request.horizon_days or 7
    
    if days_to_fire:
        predicted_date = target_date + timedelta(days=min(days_to_fire, horizon_days))
        interval_low = predicted_date - timedelta(days=2)
        interval_high = predicted_date + timedelta(days=2)
    else:
        predicted_date = None
        interval_low = None
        interval_high = None
    
    return PredictionResponse(
        shtabel_id=0,
        model_name="placeholder",
        model_version="1.0.0",
        predicted_date=predicted_date.isoformat() if predicted_date else None,
        prob_event=prob_event,
        risk_level=risk_level,
        horizon_days=horizon_days,
        interval_low=interval_low.isoformat() if interval_low else None,
        interval_high=interval_high.isoformat() if interval_high else None,
        confidence=0.5,
        meta={
            "placeholder": True,
            "max_temp": max_temp,
            "age_days": age_days,
        },
    )


@app.post("/predict/direct", response_model=PredictionResponse)
async def predict_direct(request: DirectPredictionRequest):
    """
    Прямое прогнозирование на основе параметров из формы клиента
    
    Принимает параметры напрямую без необходимости наличия штабеля в БД.
    Используется для расчета риска из формы на клиенте.
    
    Args:
        request: Параметры для прогнозирования:
            - max_temp: Максимальная температура штабеля (°C)
            - age_days: Возраст штабеля в днях
            - temp_air: Температура воздуха (°C, опционально, по умолчанию 20.0)
            - humidity: Влажность (%, опционально, по умолчанию 60.0)
            - precip: Осадки (мм, опционально, по умолчанию 0.0)
            - temp_delta_3d: Изменение температуры за 3 дня (°C, опционально, по умолчанию 0.0)
            - horizon_days: Горизонт прогнозирования (дни, опционально, по умолчанию 7)
        
    Returns:
        Результат прогнозирования с уровнем риска
    """
    try:
        logger.info(f"Direct prediction request: max_temp={request.max_temp}, age_days={request.age_days}")
        
        # Проверяем, загружена ли модель
        if not model_manager.is_model_loaded():
            logger.warning("Model not loaded, attempting to load default model...")
            if not model_manager.load_model("coal_fire_model", "1.0.0"):
                logger.warning("Model not available, using placeholder prediction")
                return _get_placeholder_prediction(request)
        
        model = model_manager.get_model()
        if not model:
            logger.warning("Model not available, using placeholder prediction")
            return _get_placeholder_prediction(request)
        
        # Подготавливаем признаки напрямую из параметров запроса
        import pandas as pd
        features_df = pd.DataFrame([{
            'Максимальная температура': request.max_temp,
            'age_days': request.age_days,
            'temp_air': request.temp_air or 20.0,
            'humidity': request.humidity or 60.0,
            'precip': request.precip or 0.0,
            'temp_delta_3d': request.temp_delta_3d or 0.0
        }])
        
        # Делаем предсказание
        proba = model.predict_proba(features_df)[0][1]
        pred = int(proba >= 0.5)
        
        # Определяем уровень риска
        if proba >= 0.8:
            risk_level = "CRITICAL"
        elif proba >= 0.6:
            risk_level = "HIGH"
        elif proba >= 0.4:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        # Рассчитываем предсказанную дату
        target_date = datetime.now()
        if pred == 1:
            days_to_fire = max(1, int((request.horizon_days or 7) * (1 - proba)))
            predicted_date = target_date + timedelta(days=days_to_fire)
        else:
            predicted_date = None
        
        # Интервал уверенности
        if predicted_date:
            interval_low = predicted_date - timedelta(days=2)
            interval_high = predicted_date + timedelta(days=2)
        else:
            interval_low = None
            interval_high = None
        
        result = {
            "shtabel_id": 0,  # Нет штабеля в БД
            "model_name": "xgboost_v1",
            "model_version": model_manager.get_model_info().get("model_version", "1.0.0") if model_manager.get_model_info() else "1.0.0",
            "predicted_date": predicted_date.isoformat() if predicted_date else None,
            "prob_event": float(proba),
            "risk_level": risk_level,
            "horizon_days": request.horizon_days or 7,
            "interval_low": interval_low.isoformat() if interval_low else None,
            "interval_high": interval_high.isoformat() if interval_high else None,
            "confidence": float(proba),
            "meta": {
                "predicted": pred,
                "features": features_df.iloc[0].to_dict(),
                "target_date": target_date.isoformat(),
            },
        }
        
        logger.info(f"Direct prediction completed: risk={risk_level}, prob={proba:.2f}")
        
        return PredictionResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Direct prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/batch")
async def batch_predict(request: BatchPredictionRequest):
    """
    Predict fire dates for multiple stockpiles
    
    Args:
        request: Batch prediction request with list of shtabel_ids
        
    Returns:
        Dictionary with list of predictions
    """
    try:
        logger.info(f"Batch prediction request for {len(request.shtabel_ids)} stockpiles")
        
        results = []
        errors = []
        
        for shtabel_id in request.shtabel_ids:
            try:
                stockpile_data = db_service.get_stockpile_data(shtabel_id)
                
                if not stockpile_data:
                    errors.append({
                        "shtabel_id": shtabel_id,
                        "error": "Stockpile not found",
                    })
                    continue
                
                prediction_result = predictor.predict(
                    stockpile_data,
                    horizon_days=request.horizon_days or 7,
                )
                
                results.append(PredictionResponse(**prediction_result))
                
            except Exception as e:
                logger.error(f"Error predicting for shtabel {shtabel_id}: {e}")
                errors.append({
                    "shtabel_id": shtabel_id,
                    "error": str(e),
                })
        
        return {
            "predictions": [r.dict() for r in results],
            "errors": errors,
            "total": len(request.shtabel_ids),
            "success": len(results),
            "failed": len(errors),
        }
        
    except Exception as e:
        logger.error(f"Batch prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Training Endpoint
# ============================================

@app.post("/train", response_model=TrainResponse)
async def train_model(request: TrainRequest, background_tasks: BackgroundTasks):
    """
    Train a new model
    
    This endpoint queues model training. Training is done synchronously
    but can be extended to use background tasks.
    
    Args:
        request: Training request with model name, version, and config
        
    Returns:
        Training response with model path and metrics
    """
    try:
        logger.info(
            f"Training request: {request.model_name} v{request.model_version}"
        )
        
        # Train model
        training_result = trainer.train_model(
            request.model_name,
            request.model_version,
            request.config,
        )
        
        # Load the newly trained model
        model_manager.load_model(request.model_name, request.model_version)
        
        logger.info(
            f"Model training completed: {request.model_name} v{request.model_version}"
        )
        
        return TrainResponse(**training_result)
        
    except Exception as e:
        logger.error(f"Training error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Metrics Endpoint
# ============================================

@app.get("/metrics")
async def get_metrics():
    """
    Получить метрики производительности модели
    
    Returns:
        Словарь с метриками модели
    """
    try:
        from src.database import DatabaseService
        from src.metrics_calculator import calculate_metrics
        
        model_info = model_manager.get_model_info()
        
        if not model_info:
            return {
                "error": "No model loaded",
                "accuracy_within_2d": 0.0,
                "mae_days": 0.0,
                "rmse_days": 0.0,
                "model_version": "none",
            }
        
        model_name = model_info.get("model_name", "unknown")
        model_version = model_info.get("model_version", "unknown")
        
        # Получаем предсказания с фактическими датами возгорания из БД
        db_service = DatabaseService()
        predictions_df = db_service.get_predictions_with_actual_fires(
            model_name=model_name if model_name != "unknown" else None,
            model_version=model_version if model_version != "unknown" else None
        )
        
        # Рассчитываем метрики
        metrics = calculate_metrics(predictions_df)
        
        return {
            "accuracy_within_2d": metrics["accuracy_within_2d"],
            "mae_days": metrics["mae_days"],
            "rmse_days": metrics["rmse_days"],
            "accuracy_within_3d": metrics.get("accuracy_within_3d", 0.0),
            "accuracy_within_5d": metrics.get("accuracy_within_5d", 0.0),
            "model_version": model_version,
            "model_name": model_name,
            "total_predictions": metrics.get("total_predictions", 0),
            "valid_predictions": metrics.get("valid_predictions", 0),
        }
        
    except Exception as e:
        logger.error(f"Metrics error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Model Management Endpoints
# ============================================

@app.post("/model/load")
async def load_model(model_name: str, model_version: str):
    """
    Load a specific model version
    
    Args:
        model_name: Name of the model
        model_version: Version of the model
        
    Returns:
        Status of model loading
    """
    try:
        success = model_manager.load_model(model_name, model_version)
        
        if success:
            return {
                "status": "loaded",
                "model_name": model_name,
                "model_version": model_version,
                "info": model_manager.get_model_info(),
            }
        else:
            raise HTTPException(
                status_code=404,
                detail=f"Model {model_name} v{model_version} not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Model loading error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model/info")
async def get_model_info():
    """
    Get information about currently loaded model
    
    Returns:
        Model information
    """
    try:
        info = model_manager.get_model_info()
        
        if not info:
            return {
                "status": "no_model_loaded",
            }
        
        return {
            "status": "loaded",
            "info": info,
        }
        
    except Exception as e:
        logger.error(f"Model info error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Validation Endpoint
# ============================================

@app.post("/validate", response_model=ValidateResponse)
async def validate_model(
    file: UploadFile = File(..., description="CSV файл с тестовыми данными"),
    model_name: Optional[str] = Query(None, description="Название модели для валидации"),
    model_version: Optional[str] = Query(None, description="Версия модели для валидации"),
):
    """
    Валидация модели на тестовом CSV файле
    
    Загружает CSV файл с тестовыми данными и рассчитывает метрики точности модели.
    CSV файл должен содержать те же колонки, что и обучающий датасет, или
    предобработанные данные с признаками (features).
    
    Формат CSV файла:
    - Должен содержать колонки: 'Максимальная температура', 'age_days', 'temp_air', 
      'humidity', 'precip', 'temp_delta_3d'
    - Опционально: 'target' (целевая переменная для расчета метрик классификации)
    - Опционально: 'actual_fire_date' и 'predicted_date' (для расчета метрик дат)
    
    Args:
        file: CSV файл с тестовыми данными
        model_name: Название модели для валидации (query параметр, опционально)
        model_version: Версия модели (query параметр, опционально)
        
    Returns:
        Результаты валидации с метриками точности:
        - accuracy, precision, recall, f1_score (если есть target)
        - mae_days, rmse_days, accuracy_within_2d/3d/5d (если есть даты)
        - статистика предсказаний
    """
    """
    Валидация модели на тестовом CSV файле
    
    Загружает CSV файл с тестовыми данными и рассчитывает метрики точности модели.
    CSV файл должен содержать те же колонки, что и обучающий датасет, или
    предобработанные данные с признаками (features).
    
    Args:
        file: CSV файл с тестовыми данными
        model_name: Название модели для валидации (опционально, используется загруженная)
        model_version: Версия модели (опционально, используется загруженная)
        
    Returns:
        Результаты валидации с метриками точности
    """
    try:
        logger.info(f"Запрос на валидацию модели. Файл: {file.filename}")
        
        # Проверяем тип файла
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=400,
                detail="Файл должен быть в формате CSV"
            )
        
        # Читаем содержимое файла
        csv_content = await file.read()
        
        if len(csv_content) == 0:
            raise HTTPException(
                status_code=400,
                detail="Файл пуст"
            )
        
        logger.info(f"Файл загружен: {len(csv_content)} байт")
        
        # Выполняем валидацию
        validation_result = validator.validate_from_csv(
            csv_content=csv_content,
            model_name=model_name,
            model_version=model_version,
        )
        
        logger.info("Валидация завершена успешно")
        
        return ValidateResponse(**validation_result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при валидации: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# CSV Prediction Endpoint
# ============================================

@app.post("/predict/csv", response_model=CSVPredictionResponse)
async def predict_from_csv(
    fires: UploadFile = File(..., description="CSV файл с данными о возгораниях"),
    supplies: UploadFile = File(..., description="CSV файл с данными о поставках"),
    temperature: UploadFile = File(..., description="CSV файл с данными о температурах"),
    weather: Optional[UploadFile] = File(None, description="CSV файл с погодными данными (опционально)"),
    horizon_days: int = Query(7, description="Горизонт прогнозирования в днях", ge=1, le=30),
):
    """
    Прогнозирование на основе CSV файлов
    
    Принимает три обязательных CSV файла в том же формате, что и датасет для обучения:
    - fires.csv: данные о возгораниях (колонки: Склад, Штабель, Дата начала/Дата возгорания, Груз/Марка)
    - supplies.csv: данные о поставках (колонки: Склад, Штабель, ВыгрузкаНаСклад/Дата поступления, Наим. ЕТСНГ/Марка)
    - temperature.csv: данные о температурах (колонки: Склад, Штабель, Дата акта/Дата, Максимальная температура)
    - weather.csv: погодные данные (опционально, колонки: date/datetime, temp_air/t, humidity, precip/precipitation)
    
    Для каждой записи в temperature.csv выполняется прогнозирование риска самовозгорания.
    
    Args:
        fires: CSV файл с данными о возгораниях
        supplies: CSV файл с данными о поставках
        temperature: CSV файл с данными о температурах
        weather: CSV файл с погодными данными (опционально)
        horizon_days: Горизонт прогнозирования в днях (1-30, по умолчанию 7)
        
    Returns:
        Результаты прогнозирования для каждой записи:
        - predictions: список прогнозов с риском, вероятностью, предсказанной датой
        - statistics: статистика по всем прогнозам
        - model_info: информация о модели
    """
    try:
        logger.info(f"Запрос на прогнозирование из CSV. Файлы: fires={fires.filename}, supplies={supplies.filename}, temperature={temperature.filename}")
        
        # Проверяем типы файлов
        for file, name in [(fires, "fires"), (supplies, "supplies"), (temperature, "temperature")]:
            if not file.filename.endswith('.csv'):
                raise HTTPException(
                    status_code=400,
                    detail=f"Файл {name} должен быть в формате CSV"
                )
        
        # Читаем содержимое файлов
        fires_content = await fires.read()
        supplies_content = await supplies.read()
        temperature_content = await temperature.read()
        weather_content = None
        
        if weather and weather.filename:
            if not weather.filename.endswith('.csv'):
                raise HTTPException(
                    status_code=400,
                    detail="Файл weather должен быть в формате CSV"
                )
            weather_content = await weather.read()
        
        # Проверяем, что файлы не пусты
        if len(fires_content) == 0 or len(supplies_content) == 0 or len(temperature_content) == 0:
            raise HTTPException(
                status_code=400,
                detail="Один или несколько CSV файлов пусты"
            )
        
        logger.info(f"Файлы загружены: fires={len(fires_content)} байт, supplies={len(supplies_content)} байт, temperature={len(temperature_content)} байт")
        
        # Выполняем прогнозирование
        prediction_result = csv_predictor.predict_from_csv(
            fires_csv=fires_content,
            supplies_csv=supplies_content,
            temperature_csv=temperature_content,
            weather_csv=weather_content,
            horizon_days=horizon_days,
        )
        
        logger.info(f"Прогнозирование завершено: {len(prediction_result['predictions'])} предсказаний")
        
        return CSVPredictionResponse(**prediction_result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при прогнозировании из CSV: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Startup Event
# ============================================

@app.on_event("startup")
async def startup_event():
    """Initialize service on startup"""
    logger.info("ML Service starting up...")
    
    # Try to load default model if exists
    try:
        # Try to load coal_fire_model.json
        success = model_manager.load_model("coal_fire_model", "1.0.0")
        if success:
            logger.info("Default model (coal_fire_model.json) loaded successfully")
        else:
            logger.warning("Could not load default model - will use placeholder predictions")
    except Exception as e:
        logger.warning(f"Could not load default model: {e}")
    
    logger.info("ML Service started")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
