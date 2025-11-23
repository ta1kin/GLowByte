"""
Batch prediction logic for multiple stockpiles
Integrated with predict_for_all.py logic
"""
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from src.model_manager import model_manager
from src.feature_engineering import prepare_features
from src.database import DatabaseService
from src.predictor import Predictor

logger = logging.getLogger(__name__)


class BatchPredictor:
    """Handles batch predictions for multiple stockpiles"""
    
    def __init__(self):
        self.predictor = Predictor()
        self.db_service = DatabaseService()
    
    def predict_all(
        self,
        shtabel_ids: List[int],
        target_date: Optional[datetime] = None,
        horizon_days: int = 7,
        threshold: float = 0.5,
    ) -> Dict[str, Any]:
        """
        Predict fire risk for all specified stockpiles
        
        This integrates the logic from predict_for_all.py
        
        Args:
            shtabel_ids: List of stockpile IDs
            target_date: Target date for prediction (default: now)
            horizon_days: Prediction horizon in days
            threshold: Probability threshold for high risk (default: 0.5)
            
        Returns:
            Dictionary with predictions and high-risk stockpiles
        """
        try:
            if target_date is None:
                target_date = datetime.now()
            
            target_date_str = target_date.strftime('%Y-%m-%d')
            
            results = []
            high_risk_stacks = []
            errors = []
            
            for shtabel_id in shtabel_ids:
                try:
                    # Get stockpile data
                    stockpile_data = self.db_service.get_stockpile_data(shtabel_id)
                    
                    if not stockpile_data:
                        errors.append({
                            "shtabel_id": shtabel_id,
                            "error": "Stockpile not found"
                        })
                        continue
                    
                    # Make prediction
                    prediction = self.predictor.predict(
                        stockpile_data,
                        horizon_days=horizon_days,
                        target_date=target_date
                    )
                    
                    results.append(prediction)
                    
                    # Check if high risk (probability >= threshold)
                    if prediction.get("prob_event", 0) >= threshold:
                        high_risk_stacks.append({
                            "shtabel_id": shtabel_id,
                            "sklad_id": stockpile_data.get("sklad_id"),
                            "label": stockpile_data.get("label"),
                            "mark": stockpile_data.get("mark"),
                            "last_temp": stockpile_data.get("last_temp", 0),
                            "probability": prediction.get("prob_event", 0),
                            "predicted": 1 if prediction.get("prob_event", 0) >= 0.5 else 0,
                            "risk_level": prediction.get("risk_level", "LOW"),
                            "predicted_date": prediction.get("predicted_date"),
                        })
                    
                except Exception as e:
                    logger.error(f"Error predicting for shtabel {shtabel_id}: {e}")
                    errors.append({
                        "shtabel_id": shtabel_id,
                        "error": str(e)
                    })
            
            return {
                "date": target_date_str,
                "total": len(shtabel_ids),
                "success": len(results),
                "failed": len(errors),
                "high_risk_count": len(high_risk_stacks),
                "high_risk_stacks": high_risk_stacks,
                "predictions": results,
                "errors": errors,
            }
            
        except Exception as e:
            logger.error(f"Error in batch prediction: {e}", exc_info=True)
            raise


# Global batch predictor instance
batch_predictor = BatchPredictor()

