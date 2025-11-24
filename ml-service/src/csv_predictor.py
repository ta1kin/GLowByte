"""
Модуль для прогнозирования на основе CSV файлов (fires, supplies, temperature)
Использует ту же логику предобработки, что и train_from_csv.py
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import logging
import io

from src.model_manager import model_manager
from src.database import DatabaseService

logger = logging.getLogger(__name__)


class CSVPredictor:
    """Класс для прогнозирования на основе CSV файлов"""
    
    def __init__(self):
        self.model_manager = model_manager
        self.db_service = DatabaseService()
    
    def predict_from_csv(
        self,
        fires_csv: bytes,
        supplies_csv: bytes,
        temperature_csv: bytes,
        weather_csv: Optional[bytes] = None,
        horizon_days: int = 7,
    ) -> Dict[str, Any]:
        """
        Прогнозирование на основе CSV файлов
        
        Args:
            fires_csv: CSV файл с данными о возгораниях
            supplies_csv: CSV файл с данными о поставках
            temperature_csv: CSV файл с данными о температурах
            weather_csv: CSV файл с погодными данными (опционально)
            horizon_days: Горизонт прогнозирования в днях
            
        Returns:
            Словарь с результатами прогнозирования для каждого штабеля
        """
        try:
            logger.info("Начало прогнозирования на основе CSV файлов")
            
            # Загружаем CSV файлы
            fires = pd.read_csv(io.BytesIO(fires_csv))
            supplies = pd.read_csv(io.BytesIO(supplies_csv))
            temp = pd.read_csv(io.BytesIO(temperature_csv))
            
            logger.info(f"Загружены файлы: fires={len(fires)}, supplies={len(supplies)}, temp={len(temp)}")
            
            # Обрабатываем погодные данные, если есть
            weather = None
            if weather_csv:
                try:
                    weather = pd.read_csv(io.BytesIO(weather_csv))
                    logger.info(f"Загружены погодные данные: {len(weather)} записей")
                except Exception as e:
                    logger.warning(f"Ошибка при загрузке погодных данных: {e}")
            
            # Предобрабатываем данные
            processed_data = self._preprocess_data(fires, supplies, temp, weather)
            
            if processed_data.empty:
                raise ValueError("После предобработки не осталось валидных данных")
            
            logger.info(f"После предобработки: {len(processed_data)} записей")
            
            # Проверяем, загружена ли модель
            if not self.model_manager.is_model_loaded():
                logger.warning("Модель не загружена, пытаемся загрузить по умолчанию...")
                if not self.model_manager.load_model("coal_fire_model", "1.0.0"):
                    raise ValueError("Модель не загружена. Пожалуйста, загрузите модель перед прогнозированием.")
            
            model = self.model_manager.get_model()
            if not model:
                raise ValueError("Модель недоступна")
            
            # Подготавливаем признаки
            feature_cols = [
                'Максимальная температура',
                'age_days',
                'temp_air',
                'humidity',
                'precip',
                'temp_delta_3d'
            ]
            
            # Проверяем наличие необходимых колонок
            missing_cols = [col for col in feature_cols if col not in processed_data.columns]
            if missing_cols:
                raise ValueError(f"Отсутствуют необходимые колонки: {missing_cols}")
            
            X = processed_data[feature_cols]
            
            # Удаляем строки с NaN
            mask = X.notnull().all(axis=1)
            X = X[mask]
            processed_data = processed_data[mask]
            
            if len(X) == 0:
                raise ValueError("Нет валидных данных после удаления NaN")
            
            logger.info(f"Валидных записей для прогнозирования: {len(X)}")
            
            # Делаем предсказания
            logger.info("Выполнение прогнозирования...")
            y_pred = model.predict(X)
            y_pred_proba = model.predict_proba(X)[:, 1]
            
            # Формируем результаты для каждой записи
            predictions = []
            target_date = datetime.now()
            
            for idx, row in processed_data.iterrows():
                # Определяем уровень риска
                proba = float(y_pred_proba[idx])
                pred = int(y_pred[idx])
                
                if proba >= 0.8:
                    risk_level = "CRITICAL"
                elif proba >= 0.6:
                    risk_level = "HIGH"
                elif proba >= 0.4:
                    risk_level = "MEDIUM"
                else:
                    risk_level = "LOW"
                
                # Рассчитываем предсказанную дату
                if pred == 1:
                    days_to_fire = max(1, int(horizon_days * (1 - proba)))
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
                
                # Получаем информацию о штабеле
                stack_id = row.get('stack_id', 'unknown')
                sklad = row.get('Склад', None)
                shtabel = row.get('Штабель', None)
                
                prediction_result = {
                    "stack_id": str(stack_id),
                    "sklad": int(sklad) if pd.notna(sklad) else None,
                    "shtabel": int(shtabel) if pd.notna(shtabel) else None,
                    "record_date": row.get('date', target_date).isoformat() if hasattr(row.get('date'), 'isoformat') else str(row.get('date', target_date)),
                    "model_name": "xgboost_v1",
                    "model_version": self.model_manager.get_model_info().get("model_version", "1.0.0") if self.model_manager.get_model_info() else "1.0.0",
                    "predicted_date": predicted_date.isoformat() if predicted_date else None,
                    "prob_event": proba,
                    "risk_level": risk_level,
                    "horizon_days": horizon_days,
                    "interval_low": interval_low.isoformat() if interval_low else None,
                    "interval_high": interval_high.isoformat() if interval_high else None,
                    "confidence": proba,
                    "features": {
                        "max_temp": float(row.get('Максимальная температура', 0)),
                        "age_days": float(row.get('age_days', 0)),
                        "temp_air": float(row.get('temp_air', 20)),
                        "humidity": float(row.get('humidity', 60)),
                        "precip": float(row.get('precip', 0)),
                        "temp_delta_3d": float(row.get('temp_delta_3d', 0)),
                    },
                }
                
                predictions.append(prediction_result)
            
            logger.info(f"Прогнозирование завершено: {len(predictions)} предсказаний")
            
            # Статистика
            stats = {
                "total_predictions": len(predictions),
                "high_risk": sum(1 for p in predictions if p["risk_level"] in ["HIGH", "CRITICAL"]),
                "medium_risk": sum(1 for p in predictions if p["risk_level"] == "MEDIUM"),
                "low_risk": sum(1 for p in predictions if p["risk_level"] == "LOW"),
                "avg_probability": float(np.mean([p["prob_event"] for p in predictions])),
            }
            
            return {
                "success": True,
                "predictions": predictions,
                "statistics": stats,
                "model_info": self.model_manager.get_model_info(),
                "prediction_date": target_date.isoformat(),
            }
            
        except Exception as e:
            logger.error(f"Ошибка при прогнозировании: {e}", exc_info=True)
            raise
    
    def _preprocess_data(
        self,
        fires: pd.DataFrame,
        supplies: pd.DataFrame,
        temp: pd.DataFrame,
        weather: Optional[pd.DataFrame] = None,
    ) -> pd.DataFrame:
        """
        Предобработка данных из CSV файлов
        Использует ту же логику, что и train_from_csv.py
        """
        try:
            logger.info("Начало предобработки данных...")
            
            # 1. Переименование колонок для совместимости
            if 'Груз' in fires.columns:
                fires = fires.rename(columns={
                    'Груз': 'Марка',
                    'Дата начала': 'Дата возгорания',
                    'Нач.форм.штабеля': 'Формирование штабеля'
                })
            
            if 'ВыгрузкаНаСклад' in supplies.columns:
                supplies = supplies.rename(columns={
                    'ВыгрузкаНаСклад': 'Дата поступления',
                    'Наим. ЕТСНГ': 'Марка',
                    'ПогрузкаНаСудно': 'Дата отправления'
                })
            
            # 2. Преобразование дат
            fires['date_fire'] = pd.to_datetime(fires.get('Дата возгорания', fires.get('Дата начала', None)), errors='coerce')
            fires = fires.dropna(subset=['date_fire'])
            
            temp['date'] = pd.to_datetime(temp.get('Дата акта', temp.get('Дата', None)), errors='coerce')
            temp = temp.dropna(subset=['date'])
            
            supplies['stack_start_date'] = pd.to_datetime(supplies.get('Дата поступления', supplies.get('ВыгрузкаНаСклад', None)), errors='coerce')
            supplies = supplies.dropna(subset=['stack_start_date'])
            
            if len(fires) == 0 or len(temp) == 0 or len(supplies) == 0:
                raise ValueError("Один или несколько CSV файлов пусты после обработки дат")
            
            # 3. Создание stack_id
            temp['stack_id'] = temp['Склад'].astype(str) + '_' + temp['Штабель'].astype(str)
            fires['stack_id'] = fires['Склад'].astype(str) + '_' + fires['Штабель'].astype(str)
            
            # Приводим даты к .date()
            fires['date_fire'] = fires['date_fire'].dt.date
            temp['date'] = temp['date'].dt.date
            
            # 4. Возраст штабеля
            supply_start = supplies.groupby(['Склад', 'Штабель'])['stack_start_date'].min().reset_index()
            supply_start['stack_id'] = supply_start['Склад'].astype(str) + '_' + supply_start['Штабель'].astype(str)
            stack_age_map = dict(zip(supply_start['stack_id'], supply_start['stack_start_date']))
            
            temp['stack_start'] = temp['stack_id'].map(stack_age_map)
            temp['stack_start'] = pd.to_datetime(temp['stack_start']).dt.date
            temp['age_days'] = (pd.to_datetime(temp['date']) - pd.to_datetime(temp['stack_start'])).dt.days
            temp['age_days'] = temp['age_days'].clip(lower=0).fillna(0)
            
            # 5. Погода: агрегация до дня
            if weather is not None and not weather.empty:
                # Переименовываем колонки погоды, если нужно
                weather_renamed = weather.copy()
                
                # Переименование колонок для совместимости
                rename_map = {}
                if 'date' not in weather_renamed.columns:
                    if 'datetime' in weather_renamed.columns:
                        rename_map['datetime'] = 'date'
                
                if 'temp_air' not in weather_renamed.columns:
                    if 't' in weather_renamed.columns:
                        rename_map['t'] = 'temp_air'
                
                if 'precip' not in weather_renamed.columns:
                    if 'precipitation' in weather_renamed.columns:
                        rename_map['precipitation'] = 'precip'
                
                if rename_map:
                    weather_renamed = weather_renamed.rename(columns=rename_map)
                
                # Преобразуем дату
                if 'date' in weather_renamed.columns:
                    weather_renamed['date'] = pd.to_datetime(weather_renamed['date'], errors='coerce').dt.date
                elif 'datetime' in weather_renamed.columns:
                    weather_renamed['date'] = pd.to_datetime(weather_renamed['datetime'], errors='coerce').dt.date
                else:
                    raise ValueError("В погодных данных отсутствует колонка date или datetime")
                
                weather_renamed = weather_renamed.dropna(subset=['date'])
                
                # Агрегируем по дням
                agg_dict = {}
                if 'temp_air' in weather_renamed.columns:
                    agg_dict['temp_air'] = 'max'
                if 'humidity' in weather_renamed.columns:
                    agg_dict['humidity'] = 'mean'
                if 'precip' in weather_renamed.columns:
                    agg_dict['precip'] = 'sum'
                
                if agg_dict:
                    weather_daily = weather_renamed.groupby('date').agg(agg_dict).reset_index()
                    
                    # Присоединяем погоду по дате
                    temp = temp.merge(weather_daily[['date'] + list(agg_dict.keys())], on='date', how='left')
                else:
                    logger.warning("В погодных данных нет нужных колонок, используем значения по умолчанию")
                    temp['temp_air'] = 20.0
                    temp['humidity'] = 60.0
                    temp['precip'] = 0.0
            else:
                logger.info("Погодные данные отсутствуют, используем значения по умолчанию")
                temp['temp_air'] = 20.0
                temp['humidity'] = 60.0
                temp['precip'] = 0.0
            
            # 6. Динамика температуры: рост за 3 дня
            temp = temp.sort_values(['stack_id', 'date']).reset_index(drop=True)
            temp['temp_lag3'] = temp.groupby('stack_id')['Максимальная температура'].shift(3)
            temp['temp_delta_3d'] = temp['Максимальная температура'] - temp['temp_lag3']
            temp['temp_delta_3d'] = temp['temp_delta_3d'].fillna(0)
            
            # 7. Подготовка финального датасета
            temp = temp.dropna(subset=['Максимальная температура'])
            
            # Заполнение пропусков в погоде
            for col in ['temp_air', 'humidity', 'precip']:
                if col in temp.columns:
                    temp[col] = temp[col].ffill().bfill().fillna(20.0 if col == 'temp_air' else (60.0 if col == 'humidity' else 0.0))
            
            logger.info(f"Предобработка завершена: {len(temp)} записей")
            return temp
            
        except Exception as e:
            logger.error(f"Ошибка при предобработке данных: {e}", exc_info=True)
            raise


# Глобальный экземпляр
csv_predictor = CSVPredictor()

