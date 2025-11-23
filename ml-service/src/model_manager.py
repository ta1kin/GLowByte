"""
Model management: loading, saving, and versioning
"""
import os
import json
import xgboost as xgb
from pathlib import Path
from typing import Optional, Dict, Any
import logging
from datetime import datetime
from src.config import settings

logger = logging.getLogger(__name__)


class ModelManager:
    """Manages ML model loading and saving"""
    
    def __init__(self, model_path: Optional[str] = None):
        # Default to models directory in project root
        if model_path:
            self.model_path = Path(model_path)
        else:
            # Try to find models directory relative to this file
            base_path = Path(__file__).parent.parent.parent
            self.model_path = base_path / "models"
        
        self.model_path.mkdir(parents=True, exist_ok=True)
        self.current_model: Optional[Any] = None
        self.current_model_info: Optional[Dict[str, Any]] = None
    
    def load_model(self, model_name: str = "coal_fire_model", model_version: str = "1.0.0") -> bool:
        """
        Load XGBoost model from JSON file
        
        Args:
            model_name: Name of the model (default: "coal_fire_model")
            model_version: Version of the model (default: "1.0.0")
            
        Returns:
            True if model loaded successfully, False otherwise
        """
        try:
            # Try different possible paths for the model
            possible_paths = [
                self.model_path / f"{model_name}.json",
                self.model_path / "coal_fire_model.json",
                Path("/app/models") / f"{model_name}.json",
                Path("/app/models") / "coal_fire_model.json",
                Path(__file__).parent.parent.parent / "models" / "coal_fire_model.json",
                Path(__file__).parent.parent.parent / "models" / f"{model_name}.json",
            ]
            
            model_file = None
            for path in possible_paths:
                if path.exists():
                    model_file = path
                    break
            
            if not model_file:
                logger.warning(f"Model file not found. Tried: {[str(p) for p in possible_paths]}")
                return False
            
            # Load XGBoost model from JSON
            self.current_model = xgb.XGBClassifier()
            self.current_model.load_model(str(model_file))
            
            # Get file size
            file_size = model_file.stat().st_size if model_file.exists() else 0
            
            # Load model info if exists
            info_file = model_file.parent / f"{model_file.stem}_info.json"
            if info_file.exists():
                with open(info_file, 'r', encoding='utf-8') as f:
                    self.current_model_info = json.load(f)
            else:
                self.current_model_info = {
                    "model_name": model_name,
                    "model_version": model_version,
                    "loaded_at": datetime.now().isoformat(),
                    "file_path": str(model_file),
                    "file_size": file_size,
                }
            
            logger.info(f"Model loaded successfully: {model_file}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {e}", exc_info=True)
            return False
    
    def save_model(
        self,
        model: Any,
        model_name: str,
        model_version: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Save XGBoost model to JSON file
        
        Args:
            model: Trained XGBoost model object
            model_name: Name of the model
            model_version: Version of the model
            metadata: Additional metadata to save
            
        Returns:
            Path to saved model file
        """
        try:
            model_file = self.model_path / f"{model_name}_v{model_version}.json"
            info_file = self.model_path / f"{model_name}_v{model_version}_info.json"
            
            # Save XGBoost model as JSON
            model.save_model(str(model_file))
            
            # Save metadata
            model_info = {
                "model_name": model_name,
                "model_version": model_version,
                "saved_at": datetime.now().isoformat(),
                "file_size": model_file.stat().st_size,
                **(metadata or {}),
            }
            
            with open(info_file, 'w', encoding='utf-8') as f:
                json.dump(model_info, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Model saved: {model_file}")
            return str(model_file)
            
        except Exception as e:
            logger.error(f"Error saving model: {e}", exc_info=True)
            raise
    
    def get_model_info(self) -> Optional[Dict[str, Any]]:
        """Get information about currently loaded model"""
        return self.current_model_info
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded"""
        return self.current_model is not None
    
    def get_model(self) -> Optional[Any]:
        """Get the currently loaded model"""
        return self.current_model


# Global model manager instance
model_manager = ModelManager()
