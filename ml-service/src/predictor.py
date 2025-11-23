"""
Prediction logic using the trained XGBoost model
Integrated with predict_one.py logic
"""
import pandas as pd
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from src.model_manager import model_manager
from src.feature_engineering import prepare_features
from src.database import DatabaseService

logger = logging.getLogger(__name__)


class Predictor:
    """Handles predictions using the loaded XGBoost model"""
    
    def __init__(self):
        self.model_manager = model_manager
        self.db_service = DatabaseService()
    
    def predict(
        self,
        stockpile_data: Dict[str, Any],
        horizon_days: int = 7,
        target_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Make prediction for a stockpile using the actual XGBoost model
        
        This integrates the logic from predict_one.py
        
        Args:
            stockpile_data: Dictionary with stockpile data
            horizon_days: Prediction horizon in days
            target_date: Target date for prediction (default: now)
            
        Returns:
            Dictionary with prediction results
        """
        try:
            if target_date is None:
                target_date = datetime.now()
            
            # Check if model is loaded
            if not self.model_manager.is_model_loaded():
                logger.warning("Model not loaded, attempting to load default model...")
                # Try to load default model
                if not self.model_manager.load_model("coal_fire_model", "1.0.0"):
                    logger.warning("Could not load model, using placeholder prediction")
                    return self._placeholder_prediction(stockpile_data, horizon_days, target_date)
            
            # Prepare features using actual feature engineering
            features_df = prepare_features(
                stockpile_data,
                target_date=target_date,
                db_service=self.db_service
            )
            
            # Get the model
            model = self.model_manager.get_model()
            if not model:
                logger.warning("Model not available, using placeholder")
                return self._placeholder_prediction(stockpile_data, horizon_days, target_date)
            
            # Make prediction using XGBoost model
            proba = model.predict_proba(features_df)[0][1]  # Probability of fire
            pred = int(proba >= 0.5)  # Binary prediction
            
            # Calculate risk level based on probability
            if proba >= 0.8:
                risk_level = "CRITICAL"
            elif proba >= 0.6:
                risk_level = "HIGH"
            elif proba >= 0.4:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"
            
            # Calculate predicted date (simplified - can be improved)
            # If prediction is positive, estimate days to fire based on probability
            if pred == 1:
                # Higher probability = sooner fire
                days_to_fire = max(1, int(horizon_days * (1 - proba)))
                predicted_date = target_date + timedelta(days=days_to_fire)
            else:
                # No fire predicted in horizon
                predicted_date = None
            
            # Calculate confidence interval (±2 days as per requirements)
            if predicted_date:
                interval_low = predicted_date - timedelta(days=2)
                interval_high = predicted_date + timedelta(days=2)
            else:
                interval_low = None
                interval_high = None
            
            result = {
                "shtabel_id": stockpile_data.get("shtabel_id"),
                "model_name": "xgboost_v1",
                "model_version": self.model_manager.get_model_info().get("model_version", "1.0.0") if self.model_manager.get_model_info() else "1.0.0",
                "predicted_date": predicted_date.isoformat() if predicted_date else None,
                "prob_event": float(proba),
                "risk_level": risk_level,
                "horizon_days": horizon_days,
                "interval_low": interval_low.isoformat() if interval_low else None,
                "interval_high": interval_high.isoformat() if interval_high else None,
                "confidence": float(proba),  # Use probability as confidence
                "meta": {
                    "predicted": pred,
                    "features": features_df.iloc[0].to_dict(),
                    "target_date": target_date.isoformat(),
                },
            }
            
            logger.info(
                f"Prediction for shtabel {stockpile_data.get('shtabel_id')}: "
                f"risk={risk_level}, prob={proba:.2f}, pred={pred}"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error making prediction: {e}", exc_info=True)
            # Fallback to placeholder on error
            return self._placeholder_prediction(stockpile_data, horizon_days, target_date)
    
    def _placeholder_prediction(
        self,
        stockpile_data: Dict[str, Any],
        horizon_days: int,
        target_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Placeholder prediction logic (fallback)
        """
        if target_date is None:
            target_date = datetime.now()
        
        last_temp = stockpile_data.get("last_temp", 0) or 0
        days_since_formation = _calculate_days_since(
            stockpile_data.get("formed_at")
        )
        
        # Calculate risk level based on temperature
        if last_temp >= 80:
            risk_level = "CRITICAL"
            prob_event = 0.9
            days_to_fire = 1 + (days_since_formation * 0.1)
        elif last_temp >= 60:
            risk_level = "HIGH"
            prob_event = 0.7
            days_to_fire = 3 + (days_since_formation * 0.15)
        elif last_temp >= 40:
            risk_level = "MEDIUM"
            prob_event = 0.5
            days_to_fire = 7 + (days_since_formation * 0.2)
        else:
            risk_level = "LOW"
            prob_event = 0.2
            days_to_fire = 14 + (days_since_formation * 0.25)
        
        predicted_date = target_date + timedelta(days=min(int(days_to_fire), horizon_days))
        
        return {
            "shtabel_id": stockpile_data.get("shtabel_id"),
            "model_name": "xgboost_v1",
            "model_version": "1.0.0",
            "predicted_date": predicted_date.isoformat(),
            "prob_event": prob_event,
            "risk_level": risk_level,
            "horizon_days": horizon_days,
            "interval_low": (predicted_date - timedelta(days=2)).isoformat(),
            "interval_high": (predicted_date + timedelta(days=2)).isoformat(),
            "confidence": 0.75,
            "meta": {
                "placeholder": True,
                "last_temp": last_temp,
                "days_since_formation": days_since_formation,
            },
        }


def _calculate_days_since(date_value: Optional[Any]) -> float:
    """Calculate days since a given date"""
    if date_value is None:
        return 0.0
    
    try:
        if isinstance(date_value, str):
            date_value = datetime.fromisoformat(date_value.replace('Z', '+00:00'))
        
        delta = datetime.now() - date_value.replace(tzinfo=None) if hasattr(date_value, 'replace') else datetime.now() - date_value
        return delta.total_seconds() / (24 * 3600)
    except Exception:
        return 0.0


# Global predictor instance
predictor = Predictor()
