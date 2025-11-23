"""
FastAPI application for ML Service
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import logging
from datetime import datetime

# Import our modules
from src.config import settings
from src.database import DatabaseService, SessionLocal
from src.model_manager import model_manager
from src.predictor import predictor
from src.trainer import trainer
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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
