"""
Feature engineering for prediction
Integrated with the actual feature engineering from predict_one.py
"""
import pandas as pd
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from src.database import DatabaseService

logger = logging.getLogger(__name__)


def prepare_features(
    stockpile_data: Dict[str, Any],
    target_date: Optional[datetime] = None,
    db_service: Optional[DatabaseService] = None
) -> pd.DataFrame:
    """
    Prepare features for prediction using the actual feature engineering logic
    
    Features used:
    - Максимальная температура (current_temp)
    - age_days (возраст штабеля в днях)
    - temp_air (температура воздуха)
    - humidity (влажность)
    - precip (осадки)
    - temp_delta_3d (изменение температуры за 3 дня)
    
    Args:
        stockpile_data: Dictionary with stockpile data from database
        target_date: Target date for prediction (default: now)
        db_service: Database service instance for fetching additional data
        
    Returns:
        DataFrame with features ready for model prediction
    """
    try:
        if target_date is None:
            target_date = datetime.now()
        
        target_date_str = target_date.strftime('%Y-%m-%d')
        target_date_date = target_date.date()
        
        # 1. Максимальная температура (current_temp)
        current_temp = stockpile_data.get("last_temp") or 0.0
        if current_temp == 0:
            # Try to get from temperature history
            temps = stockpile_data.get("temperatures", [])
            if temps:
                current_temp = max(t.get("max_temp", 0) for t in temps if t.get("max_temp"))
        
        # 2. Возраст штабеля (age_days)
        formed_at = stockpile_data.get("formed_at")
        if formed_at:
            if isinstance(formed_at, str):
                formed_at = datetime.fromisoformat(formed_at.replace('Z', '+00:00'))
            elif hasattr(formed_at, 'date'):
                formed_at = formed_at
            else:
                formed_at = None
            
            if formed_at:
                age_days = (target_date - formed_at.replace(tzinfo=None)).days
                if age_days < 0:
                    age_days = 0
            else:
                age_days = 0
        else:
            age_days = 0
        
        # 3. Погода (temp_air, humidity, precip)
        # Get weather data for target date
        temp_air = None
        humidity = None
        precip = None
        
        if db_service:
            try:
                # Get weather data for the date
                start_date = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
                end_date = start_date + timedelta(days=1)
                weather_df = db_service.get_weather_data(start_date, end_date)
                
                if not weather_df.empty:
                    # Aggregate weather data for the day
                    temp_air = weather_df['t'].max() if 't' in weather_df.columns else None
                    humidity = weather_df['humidity'].mean() if 'humidity' in weather_df.columns else None
                    precip = weather_df['precipitation'].sum() if 'precipitation' in weather_df.columns else None
            except Exception as e:
                logger.warning(f"Error fetching weather data: {e}")
        
        # Use defaults if weather data not available
        if temp_air is None:
            temp_air = 20.0  # Default temperature
        if humidity is None:
            humidity = 60.0  # Default humidity
        if precip is None:
            precip = 0.0  # Default precipitation
        
        # 4. Динамика температуры (temp_delta_3d)
        temp_delta_3d = 0.0
        temps = stockpile_data.get("temperatures", [])
        if temps and len(temps) > 0:
            # Get temperature 3 days ago
            three_days_ago = target_date - timedelta(days=3)
            
            # Find temperature records in the last 3 days before target_date
            recent_temps = []
            for temp_record in temps:
                record_date = temp_record.get("record_date")
                if record_date:
                    if isinstance(record_date, str):
                        record_date = datetime.fromisoformat(record_date.replace('Z', '+00:00'))
                    elif hasattr(record_date, 'date'):
                        record_date = record_date
                    else:
                        continue
                    
                    record_date = record_date.replace(tzinfo=None)
                    if three_days_ago <= record_date < target_date:
                        recent_temps.append({
                            'date': record_date,
                            'temp': temp_record.get("max_temp", 0)
                        })
            
            if recent_temps:
                # Get the most recent temperature before target_date
                recent_temps.sort(key=lambda x: x['date'], reverse=True)
                temp_lag3 = recent_temps[0]['temp']
                temp_delta_3d = current_temp - temp_lag3
            else:
                # No history, delta is 0
                temp_delta_3d = 0.0
        else:
            temp_delta_3d = 0.0
        
        # Формируем вектор признаков (exactly as in predict_one.py)
        features = pd.DataFrame([{
            'Максимальная температура': current_temp,
            'age_days': age_days,
            'temp_air': temp_air,
            'humidity': humidity,
            'precip': precip,
            'temp_delta_3d': temp_delta_3d
        }])
        
        logger.debug(
            f"Features prepared for shtabel {stockpile_data.get('shtabel_id')}: "
            f"temp={current_temp}, age={age_days}, delta_3d={temp_delta_3d}"
        )
        return features
        
    except Exception as e:
        logger.error(f"Error preparing features: {e}", exc_info=True)
        raise


def preprocess_data(raw_data: pd.DataFrame) -> pd.DataFrame:
    """
    Preprocess raw data using the actual preprocessing pipeline
    
    This function integrates the logic from data_processing.py
    
    Args:
        raw_data: Raw DataFrame from database
        
    Returns:
        Preprocessed DataFrame ready for model
    """
    # TODO: Integrate full preprocessing pipeline from data_processing.py
    # For now, return as-is
    logger.warning("Using simplified preprocessing - full pipeline to be integrated")
    return raw_data.copy()
