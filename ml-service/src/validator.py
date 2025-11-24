"""
Модуль для валидации модели на тестовых CSV файлах
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import logging
from pathlib import Path
import io

from src.model_manager import model_manager
from src.feature_engineering import preprocess_data
from sklearn.metrics import (
    classification_report, 
    f1_score, 
    accuracy_score, 
    precision_score, 
    recall_score,
    confusion_matrix
)

logger = logging.getLogger(__name__)


class ModelValidator:
    """Класс для валидации модели на тестовых данных"""
    
    def __init__(self):
        self.model_manager = model_manager
    
    def validate_from_csv(
        self,
        csv_file_path: Optional[str] = None,
        csv_content: Optional[bytes] = None,
        model_name: Optional[str] = None,
        model_version: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Валидация модели на тестовом CSV файле
        
        CSV файл должен содержать те же колонки, что и обучающий датасет:
        - fires.csv: данные о возгораниях
        - temperature.csv: данные о температурах
        - supplies.csv: данные о поставках
        - weather_data_*.csv: погодные данные (опционально)
        
        Или объединенный файл с предобработанными данными
        
        Args:
            csv_file_path: Путь к CSV файлу на диске
            csv_content: Содержимое CSV файла в байтах (альтернатива пути)
            model_name: Название модели для валидации (если None, используется загруженная)
            model_version: Версия модели (если None, используется загруженная)
            
        Returns:
            Словарь с метриками валидации
        """
        try:
            logger.info("Начало валидации модели на CSV файле")
            
            # Загружаем CSV файл
            if csv_content:
                df = pd.read_csv(io.BytesIO(csv_content))
            elif csv_file_path:
                df = pd.read_csv(csv_file_path)
            else:
                raise ValueError("Необходимо указать либо csv_file_path, либо csv_content")
            
            logger.info(f"Загружен CSV файл: {len(df)} записей, {len(df.columns)} колонок")
            logger.info(f"Колонки: {df.columns.tolist()}")
            
            # Проверяем, загружена ли модель
            if not self.model_manager.is_model_loaded():
                if model_name and model_version:
                    logger.info(f"Загрузка модели {model_name} v{model_version}")
                    if not self.model_manager.load_model(model_name, model_version):
                        raise ValueError(f"Не удалось загрузить модель {model_name} v{model_version}")
                else:
                    raise ValueError("Модель не загружена. Укажите model_name и model_version")
            
            model = self.model_manager.get_model()
            if not model:
                raise ValueError("Модель недоступна")
            
            # Предобработка данных
            # Проверяем формат данных - может быть объединенный файл или отдельные файлы
            processed_df = self._preprocess_test_data(df)
            
            if processed_df.empty:
                raise ValueError("После предобработки не осталось валидных данных")
            
            logger.info(f"После предобработки: {len(processed_df)} записей")
            
            # Подготовка признаков и целевой переменной
            feature_cols = [
                'Максимальная температура',
                'age_days',
                'temp_air',
                'humidity',
                'precip',
                'temp_delta_3d'
            ]
            
            # Проверяем наличие необходимых колонок
            missing_cols = [col for col in feature_cols if col not in processed_df.columns]
            if missing_cols:
                raise ValueError(f"Отсутствуют необходимые колонки: {missing_cols}")
            
            X = processed_df[feature_cols]
            
            # Проверяем наличие целевой переменной
            if 'target' not in processed_df.columns:
                logger.warning("Целевая переменная 'target' отсутствует. Будет выполнена только проверка предсказаний без метрик классификации.")
                y_true = None
            else:
                y_true = processed_df['target']
            
            # Удаляем строки с NaN
            mask = X.notnull().all(axis=1)
            if y_true is not None:
                mask = mask & y_true.notnull()
            
            X = X[mask]
            if y_true is not None:
                y_true = y_true[mask]
            
            if len(X) == 0:
                raise ValueError("Нет валидных данных после удаления NaN")
            
            logger.info(f"Валидных записей для валидации: {len(X)}")
            
            # Делаем предсказания
            logger.info("Выполнение предсказаний...")
            y_pred = model.predict(X)
            y_pred_proba = model.predict_proba(X)[:, 1]
            
            # Рассчитываем метрики
            metrics = {}
            
            if y_true is not None:
                # Метрики классификации
                accuracy = accuracy_score(y_true, y_pred)
                precision = precision_score(y_true, y_pred, pos_label=1, zero_division=0)
                recall = recall_score(y_true, y_pred, pos_label=1, zero_division=0)
                f1 = f1_score(y_true, y_pred, pos_label=1, zero_division=0)
                
                # Confusion matrix
                cm = confusion_matrix(y_true, y_pred)
                tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)
                
                metrics.update({
                    "accuracy": float(accuracy),
                    "precision": float(precision),
                    "recall": float(recall),
                    "f1_score": float(f1),
                    "confusion_matrix": {
                        "true_negative": int(tn),
                        "false_positive": int(fp),
                        "false_negative": int(fn),
                        "true_positive": int(tp),
                    },
                    "classification_report": classification_report(y_true, y_pred, output_dict=True),
                })
                
                logger.info(f"Метрики классификации: Accuracy={accuracy:.4f}, F1={f1:.4f}, Precision={precision:.4f}, Recall={recall:.4f}")
            
            # Статистика предсказаний
            metrics.update({
                "total_samples": len(X),
                "predictions": {
                    "positive": int((y_pred == 1).sum()),
                    "negative": int((y_pred == 0).sum()),
                    "avg_probability": float(y_pred_proba.mean()),
                    "min_probability": float(y_pred_proba.min()),
                    "max_probability": float(y_pred_proba.max()),
                },
            })
            
            # Если есть даты возгорания, рассчитываем метрики для дат
            if 'actual_fire_date' in processed_df.columns and 'predicted_date' in processed_df.columns:
                date_metrics = self._calculate_date_metrics(processed_df[mask])
                metrics.update(date_metrics)
            
            logger.info("Валидация завершена успешно")
            
            return {
                "success": True,
                "metrics": metrics,
                "model_info": self.model_manager.get_model_info(),
                "validation_date": datetime.now().isoformat(),
            }
            
        except Exception as e:
            logger.error(f"Ошибка при валидации: {e}", exc_info=True)
            raise
    
    def _preprocess_test_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Предобработка тестовых данных из CSV
        
        Поддерживает два формата:
        1. Объединенный файл с уже предобработанными данными (с колонками features + target)
        2. Отдельные файлы (fires, temperature, supplies, weather) - требует дополнительной обработки
        """
        # Проверяем, является ли это объединенным файлом с признаками
        feature_cols = [
            'Максимальная температура',
            'age_days',
            'temp_air',
            'humidity',
            'precip',
            'temp_delta_3d'
        ]
        
        # Если есть все необходимые колонки, считаем что это предобработанный файл
        if all(col in df.columns for col in feature_cols):
            logger.info("Обнаружен предобработанный файл с признаками")
            return df.copy()
        
        # Иначе пытаемся обработать как сырые данные
        # Это упрощенная версия - в реальности нужна полная предобработка как в train_from_csv.py
        logger.warning("Файл не содержит предобработанных признаков. Используется упрощенная предобработка.")
        
        # Пытаемся создать минимальные признаки из доступных данных
        processed = df.copy()
        
        # Максимальная температура
        if 'Максимальная температура' not in processed.columns:
            if 'max_temp' in processed.columns:
                processed['Максимальная температура'] = processed['max_temp']
            elif 'temperature' in processed.columns:
                processed['Максимальная температура'] = processed['temperature']
            else:
                processed['Максимальная температура'] = 0.0
        
        # age_days
        if 'age_days' not in processed.columns:
            if 'Дата начала' in processed.columns and 'Дата акта' in processed.columns:
                processed['Дата начала'] = pd.to_datetime(processed['Дата начала'], errors='coerce')
                processed['Дата акта'] = pd.to_datetime(processed['Дата акта'], errors='coerce')
                processed['age_days'] = (processed['Дата акта'] - processed['Дата начала']).dt.days
            else:
                processed['age_days'] = 0
        
        # Погодные данные
        for col, default in [('temp_air', 20.0), ('humidity', 60.0), ('precip', 0.0)]:
            if col not in processed.columns:
                processed[col] = default
        
        # temp_delta_3d
        if 'temp_delta_3d' not in processed.columns:
            processed['temp_delta_3d'] = 0.0
        
        # Заполняем NaN
        for col in feature_cols:
            if col in processed.columns:
                processed[col] = processed[col].fillna(0.0)
        
        return processed
    
    def _calculate_date_metrics(self, df: pd.DataFrame) -> Dict[str, float]:
        """
        Рассчитать метрики для предсказания дат возгорания
        """
        try:
            if 'actual_fire_date' not in df.columns or 'predicted_date' not in df.columns:
                return {}
            
            # Конвертируем даты
            df = df.copy()
            df['actual_fire_date'] = pd.to_datetime(df['actual_fire_date'], errors='coerce')
            df['predicted_date'] = pd.to_datetime(df['predicted_date'], errors='coerce')
            
            # Фильтруем валидные даты
            valid_mask = df['actual_fire_date'].notna() & df['predicted_date'].notna()
            valid_df = df[valid_mask]
            
            if len(valid_df) == 0:
                return {}
            
            # Рассчитываем разницу в днях
            errors_days = (valid_df['predicted_date'] - valid_df['actual_fire_date']).dt.total_seconds() / (24 * 3600)
            errors_days_abs = errors_days.abs()
            
            # Метрики
            mae_days = float(errors_days_abs.mean())
            rmse_days = float(np.sqrt((errors_days_abs ** 2).mean()))
            accuracy_within_2d = float((errors_days_abs <= 2).sum() / len(errors_days_abs) * 100)
            accuracy_within_3d = float((errors_days_abs <= 3).sum() / len(errors_days_abs) * 100)
            accuracy_within_5d = float((errors_days_abs <= 5).sum() / len(errors_days_abs) * 100)
            
            return {
                "date_metrics": {
                    "mae_days": round(mae_days, 2),
                    "rmse_days": round(rmse_days, 2),
                    "accuracy_within_2d": round(accuracy_within_2d, 2),
                    "accuracy_within_3d": round(accuracy_within_3d, 2),
                    "accuracy_within_5d": round(accuracy_within_5d, 2),
                    "valid_predictions": len(valid_df),
                }
            }
        except Exception as e:
            logger.warning(f"Ошибка при расчете метрик дат: {e}")
            return {}


# Глобальный экземпляр валидатора
validator = ModelValidator()

