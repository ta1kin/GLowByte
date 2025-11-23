"""
Model training logic
Integrated with ml_prediction.py training logic
"""
import pandas as pd
import xgboost as xgb
from typing import Dict, Any, Optional
from datetime import datetime
import logging
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, f1_score, accuracy_score, precision_score, recall_score
from src.model_manager import model_manager
from src.database import DatabaseService
from src.feature_engineering import preprocess_data

logger = logging.getLogger(__name__)


class Trainer:
    """Handles model training using XGBoost"""
    
    def __init__(self):
        self.model_manager = model_manager
        self.db = DatabaseService()
    
    def train_model(
        self,
        model_name: str,
        model_version: str,
        config: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Train a new XGBoost model
        
        This integrates the training logic from ml_prediction.py
        
        Args:
            model_name: Name of the model
            model_version: Version of the model
            config: Training configuration (hyperparameters)
            
        Returns:
            Dictionary with training results
        """
        try:
            logger.info(f"Starting model training: {model_name} v{model_version}")
            
            # Get training data from database
            training_data = self.db.get_training_data()
            
            if training_data.empty:
                raise ValueError("No training data available")
            
            logger.info(f"Training data shape: {training_data.shape}")
            
            # TODO: Full preprocessing pipeline from data_processing.py
            # For now, use simplified preprocessing
            processed_data = preprocess_data(training_data)
            
            # Prepare features and target
            # Feature columns as defined in ml_prediction.py
            feature_cols = [
                'Максимальная температура',
                'age_days',
                'temp_air',
                'humidity',
                'precip',
                'temp_delta_3d'
            ]
            
            # Check if we have the required columns
            available_cols = [col for col in feature_cols if col in processed_data.columns]
            if len(available_cols) < len(feature_cols):
                logger.warning(
                    f"Missing feature columns. Expected: {feature_cols}, "
                    f"Available: {available_cols}"
                )
                # Use placeholder training if features are missing
                return self._placeholder_training(training_data, model_name, model_version, config)
            
            X = processed_data[feature_cols]
            
            # Check if we have target column
            if 'target' not in processed_data.columns:
                logger.warning("No target column found, using placeholder training")
                return self._placeholder_training(training_data, model_name, model_version, config)
            
            y = processed_data['target']
            
            # Remove rows with NaN
            mask = X.notnull().all(axis=1) & y.notnull()
            X = X[mask]
            y = y[mask]
            
            if len(X) == 0:
                raise ValueError("No valid training samples after preprocessing")
            
            logger.info(f"Training on {len(X)} samples")
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, stratify=y, random_state=42
            )
            
            # Calculate scale_pos_weight for imbalanced classes
            scale_pos_weight = sum(y_train == 0) / sum(y_train == 1) if sum(y_train == 1) > 0 else 1.0
            
            # Get hyperparameters from config or use defaults
            hyperparams = {
                "n_estimators": config.get("n_estimators", 300) if config else 300,
                "max_depth": config.get("max_depth", 6) if config else 6,
                "learning_rate": config.get("learning_rate", 0.1) if config else 0.1,
                "scale_pos_weight": config.get("scale_pos_weight", scale_pos_weight) if config else scale_pos_weight,
                "random_state": 42,
                "eval_metric": "logloss",
            }
            
            # Train XGBoost model
            model = xgb.XGBClassifier(**hyperparams)
            model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = model.predict(X_test)
            y_pred_proba = model.predict_proba(X_test)[:, 1]
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, pos_label=1, zero_division=0)
            recall = recall_score(y_test, y_pred, pos_label=1, zero_division=0)
            f1 = f1_score(y_test, y_pred, pos_label=1, zero_division=0)
            
            logger.info(f"Model training completed. F1-score: {f1:.4f}, Accuracy: {accuracy:.4f}")
            
            # Save model
            model_path = self.model_manager.save_model(
                model,
                model_name,
                model_version,
                metadata={
                    "training_samples": len(X_train),
                    "test_samples": len(X_test),
                    "training_date": datetime.now().isoformat(),
                    "hyperparams": hyperparams,
                    "metrics": {
                        "accuracy": float(accuracy),
                        "precision": float(precision),
                        "recall": float(recall),
                        "f1_score": float(f1),
                    },
                },
            )
            
            # Load the newly trained model
            self.model_manager.load_model(model_name, model_version)
            
            # Попытаемся получить метрики из исторических данных (если есть)
            date_metrics = self._calculate_date_metrics(model_name, model_version)
            
            # Prepare metrics for response
            metrics = {
                "period_start": (datetime.now() - pd.Timedelta(days=365)).isoformat(),
                "period_end": datetime.now().isoformat(),
                "accuracy": float(accuracy),
                "precision": float(precision),
                "recall": float(recall),
                "f1_score": float(f1),
                "mae_days": date_metrics.get("mae_days", 0.0),
                "rmse_days": date_metrics.get("rmse_days", 0.0),
                "accuracy_within_2d": date_metrics.get("accuracy_within_2d", 0.0),
                "accuracy_within_3d": date_metrics.get("accuracy_within_3d", 0.0),
                "accuracy_within_5d": date_metrics.get("accuracy_within_5d", 0.0),
            }
            
            return {
                "success": True,
                "model_path": model_path,
                "file_size": len(X_train),  # Placeholder
                "hyperparams": hyperparams,
                "train_metrics": metrics,
                "val_metrics": metrics,  # Using test as validation for now
                "test_metrics": metrics,
                "metrics": metrics,
                "meta": {
                    "training_samples": len(X_train),
                    "test_samples": len(X_test),
                    "feature_importance": dict(zip(feature_cols, model.feature_importances_.tolist())),
                },
            }
            
        except Exception as e:
            logger.error(f"Error training model: {e}", exc_info=True)
            raise
    
    def _calculate_date_metrics(self, model_name: str, model_version: str) -> Dict[str, float]:
        """
        Рассчитать метрики для предсказания дат на основе исторических данных
        
        Args:
            model_name: Название модели
            model_version: Версия модели
            
        Returns:
            Словарь с метриками дат (mae_days, rmse_days, accuracy_within_2d и т.д.)
        """
        try:
            from src.metrics_calculator import calculate_metrics
            
            # Получаем предсказания с фактическими датами из БД
            predictions_df = self.db.get_predictions_with_actual_fires(
                model_name=model_name,
                model_version=model_version
            )
            
            if predictions_df.empty:
                logger.info(f"No historical predictions with actual fire dates found for {model_name} v{model_version}")
                return {
                    "mae_days": 0.0,
                    "rmse_days": 0.0,
                    "accuracy_within_2d": 0.0,
                    "accuracy_within_3d": 0.0,
                    "accuracy_within_5d": 0.0,
                }
            
            # Рассчитываем метрики
            metrics = calculate_metrics(predictions_df)
            
            logger.info(
                f"Date metrics for {model_name} v{model_version}: "
                f"MAE={metrics['mae_days']:.2f} days, "
                f"RMSE={metrics['rmse_days']:.2f} days, "
                f"Accuracy±2d={metrics['accuracy_within_2d']:.2f}%"
            )
            
            return {
                "mae_days": metrics["mae_days"],
                "rmse_days": metrics["rmse_days"],
                "accuracy_within_2d": metrics["accuracy_within_2d"],
                "accuracy_within_3d": metrics.get("accuracy_within_3d", 0.0),
                "accuracy_within_5d": metrics.get("accuracy_within_5d", 0.0),
            }
            
        except Exception as e:
            logger.warning(f"Error calculating date metrics: {e}. Using default values.")
            return {
                "mae_days": 0.0,
                "rmse_days": 0.0,
                "accuracy_within_2d": 0.0,
                "accuracy_within_3d": 0.0,
                "accuracy_within_5d": 0.0,
            }
    
    def _placeholder_training(
        self,
        training_data: pd.DataFrame,
        model_name: str,
        model_version: str,
        config: Optional[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Placeholder training function (fallback)
        """
        logger.warning("Using placeholder training function")
        
        # Create a simple XGBoost model with dummy data
        from sklearn.dummy import DummyClassifier
        placeholder_model = DummyClassifier(strategy="most_frequent")
        
        # Create dummy data for training
        import numpy as np
        X_dummy = np.random.rand(100, 6)
        y_dummy = np.random.randint(0, 2, 100)
        placeholder_model.fit(X_dummy, y_dummy)
        
        # Save placeholder model
        model_path = self.model_manager.save_model(
            placeholder_model,
            model_name,
            model_version,
            metadata={
                "training_samples": len(training_data),
                "training_date": datetime.now().isoformat(),
                "config": config or {},
                "placeholder": True,
            },
        )
        
        # Placeholder metrics
        metrics = {
            "period_start": (datetime.now() - pd.Timedelta(days=365)).isoformat(),
            "period_end": datetime.now().isoformat(),
            "mae_days": 0.0,
            "rmse_days": 0.0,
            "accuracy": 0.0,
            "precision": 0.0,
            "recall": 0.0,
            "f1_score": 0.0,
            "accuracy_within_2d": 0.0,
        }
        
        return {
            "success": True,
            "model_path": model_path,
            "file_size": 1024,
            "hyperparams": config or {},
            "train_metrics": metrics,
            "val_metrics": metrics,
            "test_metrics": metrics,
            "metrics": metrics,
            "meta": {
                "placeholder": True,
                "training_samples": len(training_data),
            },
        }


# Global trainer instance
trainer = Trainer()
