"""
Модуль для расчета метрик качества модели предсказания дат возгорания
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


def calculate_metrics(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Рассчитать метрики качества предсказаний дат возгорания
    
    Args:
        df: DataFrame с колонками:
            - predicted_date: предсказанная дата возгорания
            - actual_fire_date: фактическая дата возгорания
            - accuracy_days: разница в днях (опционально, будет рассчитана если отсутствует)
    
    Returns:
        Словарь с метриками:
        - mae_days: Mean Absolute Error в днях
        - rmse_days: Root Mean Squared Error в днях
        - accuracy_within_2d: Процент предсказаний в пределах ±2 дня
        - accuracy_within_3d: Процент предсказаний в пределах ±3 дня
        - accuracy_within_5d: Процент предсказаний в пределах ±5 дня
        - total_predictions: Общее количество предсказаний
        - valid_predictions: Количество валидных предсказаний (с обеими датами)
    """
    if df.empty:
        return {
            "mae_days": 0.0,
            "rmse_days": 0.0,
            "accuracy_within_2d": 0.0,
            "accuracy_within_3d": 0.0,
            "accuracy_within_5d": 0.0,
            "total_predictions": 0,
            "valid_predictions": 0,
        }
    
    # Убедимся, что у нас есть обе даты
    required_cols = ['predicted_date', 'actual_fire_date']
    if not all(col in df.columns for col in required_cols):
        logger.warning(f"Missing required columns. Expected: {required_cols}, Got: {df.columns.tolist()}")
        return {
            "mae_days": 0.0,
            "rmse_days": 0.0,
            "accuracy_within_2d": 0.0,
            "accuracy_within_3d": 0.0,
            "accuracy_within_5d": 0.0,
            "total_predictions": len(df),
            "valid_predictions": 0,
        }
    
    # Фильтруем строки с валидными датами
    valid_df = df.dropna(subset=required_cols).copy()
    
    if valid_df.empty:
        return {
            "mae_days": 0.0,
            "rmse_days": 0.0,
            "accuracy_within_2d": 0.0,
            "accuracy_within_3d": 0.0,
            "accuracy_within_5d": 0.0,
            "total_predictions": len(df),
            "valid_predictions": 0,
        }
    
    # Убедимся, что даты в правильном формате
    if not pd.api.types.is_datetime64_any_dtype(valid_df['predicted_date']):
        valid_df['predicted_date'] = pd.to_datetime(valid_df['predicted_date'])
    if not pd.api.types.is_datetime64_any_dtype(valid_df['actual_fire_date']):
        valid_df['actual_fire_date'] = pd.to_datetime(valid_df['actual_fire_date'])
    
    # Рассчитываем разницу в днях
    if 'accuracy_days' not in valid_df.columns or valid_df['accuracy_days'].isna().any():
        valid_df['accuracy_days'] = (
            valid_df['predicted_date'] - valid_df['actual_fire_date']
        ).dt.total_seconds() / (24 * 3600)
    
    # Берем абсолютное значение ошибки
    errors_days = valid_df['accuracy_days'].abs()
    
    # MAE (Mean Absolute Error)
    mae_days = float(errors_days.mean()) if len(errors_days) > 0 else 0.0
    
    # RMSE (Root Mean Squared Error)
    rmse_days = float(np.sqrt((errors_days ** 2).mean())) if len(errors_days) > 0 else 0.0
    
    # Accuracy в пределах N дней
    accuracy_within_2d = float((errors_days <= 2).sum() / len(errors_days) * 100) if len(errors_days) > 0 else 0.0
    accuracy_within_3d = float((errors_days <= 3).sum() / len(errors_days) * 100) if len(errors_days) > 0 else 0.0
    accuracy_within_5d = float((errors_days <= 5).sum() / len(errors_days) * 100) if len(errors_days) > 0 else 0.0
    
    return {
        "mae_days": round(mae_days, 2),
        "rmse_days": round(rmse_days, 2),
        "accuracy_within_2d": round(accuracy_within_2d, 2),
        "accuracy_within_3d": round(accuracy_within_3d, 2),
        "accuracy_within_5d": round(accuracy_within_5d, 2),
        "total_predictions": len(df),
        "valid_predictions": len(valid_df),
    }

