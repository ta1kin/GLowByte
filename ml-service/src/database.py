"""
Database connection and queries for ML Service
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from typing import Optional, List, Dict, Any
import pandas as pd
from datetime import datetime, timedelta
from src.config import settings
import logging

logger = logging.getLogger(__name__)

# Create database engine
# Use psycopg2 with proper parameter style
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=NullPool,
    pool_pre_ping=True,
    echo=False,
    connect_args={"options": "-c statement_timeout=30000"}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class DatabaseService:
    """Service for database operations"""
    
    def __init__(self):
        self.engine = engine
    
    def get_stockpile_data(self, shtabel_id: int) -> Optional[Dict[str, Any]]:
        """
        Get all data for a stockpile needed for prediction
        
        Returns:
            Dictionary with stockpile data including:
            - stockpile info (shtabel)
            - supplies history
            - temperature history
            - weather data
            - fire history
        """
        try:
            with self.engine.connect() as conn:
                # Use pandas read_sql for proper parameter handling
                # This avoids the psycopg2 parameter conversion issue
                query_str = """
                    SELECT 
                        s.id as shtabel_id,
                        s.sklad_id,
                        s.label,
                        s.mark,
                        s.formed_at,
                        s.height_m,
                        s.width_m,
                        s.length_m,
                        s.mass_t,
                        s.current_mass,
                        s.last_temp,
                        s.last_temp_date,
                        s.status,
                        sk.number as sklad_number,
                        sk.name as sklad_name
                    FROM "Shtabel" s
                    JOIN "Sklad" sk ON s.sklad_id = sk.id
                    WHERE s.id = %(shtabel_id)s
                """
                df = pd.read_sql(query_str, conn, params={"shtabel_id": shtabel_id})
                
                if df.empty:
                    return None
                
                if df.empty:
                    return None
                
                row = df.iloc[0]
                
                stockpile_data = {
                    "shtabel_id": int(row["shtabel_id"]),
                    "sklad_id": int(row["sklad_id"]),
                    "label": str(row["label"]) if pd.notna(row["label"]) else None,
                    "mark": str(row["mark"]) if pd.notna(row["mark"]) else None,
                    "formed_at": row["formed_at"] if pd.notna(row["formed_at"]) else None,
                    "height_m": float(row["height_m"]) if pd.notna(row["height_m"]) else None,
                    "width_m": float(row["width_m"]) if pd.notna(row["width_m"]) else None,
                    "length_m": float(row["length_m"]) if pd.notna(row["length_m"]) else None,
                    "mass_t": float(row["mass_t"]) if pd.notna(row["mass_t"]) else None,
                    "current_mass": float(row["current_mass"]) if pd.notna(row["current_mass"]) else None,
                    "last_temp": float(row["last_temp"]) if pd.notna(row["last_temp"]) else None,
                    "last_temp_date": row["last_temp_date"] if pd.notna(row["last_temp_date"]) else None,
                    "status": str(row["status"]) if pd.notna(row["status"]) else None,
                    "sklad_number": int(row["sklad_number"]) if pd.notna(row["sklad_number"]) else None,
                    "sklad_name": str(row["sklad_name"]) if pd.notna(row["sklad_name"]) else None,
                }
                
                # Get supplies history
                supplies_query = """
                    SELECT 
                        date_in,
                        mark,
                        to_storage_t,
                        to_ship_t
                    FROM "Supply"
                    WHERE shtabel_id = %(shtabel_id)s
                    ORDER BY date_in DESC
                    LIMIT 100
                """
                supplies_df = pd.read_sql(supplies_query, conn, params={"shtabel_id": shtabel_id})
                stockpile_data["supplies"] = [
                    {
                        "date_in": row["date_in"],
                        "mark": str(row["mark"]) if pd.notna(row["mark"]) else None,
                        "to_storage_t": float(row["to_storage_t"]) if pd.notna(row["to_storage_t"]) else None,
                        "to_ship_t": float(row["to_ship_t"]) if pd.notna(row["to_ship_t"]) else None,
                    }
                    for _, row in supplies_df.iterrows()
                ]
                
                # Get temperature history (last 90 days)
                start_date = datetime.now() - timedelta(days=90)
                temp_query = """
                    SELECT 
                        record_date,
                        max_temp,
                        risk_level,
                        piket
                    FROM "TempRecord"
                    WHERE shtabel_id = %(shtabel_id)s
                        AND record_date >= %(start_date)s
                    ORDER BY record_date DESC
                """
                temp_df = pd.read_sql(temp_query, conn, params={"shtabel_id": shtabel_id, "start_date": start_date})
                stockpile_data["temperatures"] = [
                    {
                        "record_date": row["record_date"],
                        "max_temp": float(row["max_temp"]) if pd.notna(row["max_temp"]) else None,
                        "risk_level": str(row["risk_level"]) if pd.notna(row["risk_level"]) else None,
                        "piket": str(row["piket"]) if pd.notna(row["piket"]) else None,
                    }
                    for _, row in temp_df.iterrows()
                ]
                
                # Get fire history
                fire_query = """
                    SELECT 
                        start_date,
                        end_date,
                        weight_t,
                        duration_hours
                    FROM "FireRecord"
                    WHERE shtabel_id = %(shtabel_id)s
                    ORDER BY start_date DESC
                    LIMIT 10
                """
                fire_df = pd.read_sql(fire_query, conn, params={"shtabel_id": shtabel_id})
                stockpile_data["fires"] = [
                {
                    "start_date": row["start_date"],
                    "end_date": row["end_date"] if pd.notna(row["end_date"]) else None,
                    "weight_t": float(row["weight_t"]) if pd.notna(row["weight_t"]) else None,
                    "duration_hours": float(row["duration_hours"]) if pd.notna(row["duration_hours"]) else None,
                }
                for _, row in fire_df.iterrows()
            ]
            
            return stockpile_data
                
        except Exception as e:
            logger.error(f"Error getting stockpile data: {e}")
            raise
    
    def get_weather_data(
        self, start_date: datetime, end_date: datetime
    ) -> pd.DataFrame:
        """
        Get weather data for date range
        
        Returns:
            DataFrame with weather data
        """
        try:
            query = """
                SELECT 
                    ts,
                    t,
                    p,
                    humidity,
                    precipitation,
                    wind_dir,
                    v_avg,
                    v_max,
                    cloudcover,
                    visibility
                FROM "Weather"
                WHERE ts >= %(start_date)s AND ts <= %(end_date)s
                ORDER BY ts ASC
            """
            with self.engine.connect() as conn:
                df = pd.read_sql(query, conn, params={"start_date": start_date, "end_date": end_date})
            return df
                
        except Exception as e:
            logger.error(f"Error getting weather data: {e}")
            raise
    
    def get_training_data(self) -> pd.DataFrame:
        """
        Get all data needed for model training
        
        Returns:
            DataFrame with training data
        """
        try:
            # This will be used when implementing training
            # For now, return empty DataFrame
            query = text("""
                SELECT 
                    s.id as shtabel_id,
                    s.sklad_id,
                    s.mark,
                    s.formed_at,
                    s.mass_t,
                    s.current_mass,
                    s.last_temp,
                    fr.start_date as fire_start_date,
                    fr.end_date as fire_end_date,
                    fr.weight_t as fire_weight
                FROM "Shtabel" s
                LEFT JOIN "FireRecord" fr ON s.id = fr.shtabel_id
                WHERE s.status = 'ACTIVE' OR fr.id IS NOT NULL
            """)
            
            with self.engine.connect() as conn:
                df = pd.read_sql(query, conn)
                return df
                
        except Exception as e:
            logger.error(f"Error getting training data: {e}")
            raise
    
    def get_predictions_with_actual_fires(self, model_name: Optional[str] = None, model_version: Optional[str] = None) -> pd.DataFrame:
        """
        Получить предсказания с фактическими датами возгорания для расчета метрик
        
        Args:
            model_name: Фильтр по названию модели (опционально)
            model_version: Фильтр по версии модели (опционально)
            
        Returns:
            DataFrame с колонками:
            - predicted_date: предсказанная дата возгорания
            - actual_fire_date: фактическая дата возгорания
            - accuracy_days: разница в днях (предсказанная - фактическая)
        """
        try:
            # Используем правильный синтаксис для psycopg2
            query_str = """
                SELECT 
                    p.id,
                    p.predicted_date,
                    p.actual_fire_date,
                    p.accuracy_days,
                    p.is_accurate,
                    p.model_name,
                    p.model_version,
                    p.shtabel_id,
                    p.ts as prediction_timestamp
                FROM "Prediction" p
                WHERE p.predicted_date IS NOT NULL 
                    AND p.actual_fire_date IS NOT NULL
                    AND (%(model_name)s IS NULL OR p.model_name = %(model_name)s)
                    AND (%(model_version)s IS NULL OR p.model_version = %(model_version)s)
                ORDER BY p.ts DESC
            """
            
            with self.engine.connect() as conn:
                df = pd.read_sql(
                    query_str, 
                    conn, 
                    params={
                        "model_name": model_name,
                        "model_version": model_version
                    }
                )
                
                if not df.empty:
                    # Убедимся, что даты в правильном формате
                    df['predicted_date'] = pd.to_datetime(df['predicted_date'])
                    df['actual_fire_date'] = pd.to_datetime(df['actual_fire_date'])
                    
                    # Пересчитаем accuracy_days если его нет или он некорректен
                    if 'accuracy_days' not in df.columns or df['accuracy_days'].isna().any():
                        df['accuracy_days'] = (df['predicted_date'] - df['actual_fire_date']).dt.total_seconds() / (24 * 3600)
                
                return df
                
        except Exception as e:
            logger.error(f"Error getting predictions with actual fires: {e}")
            return pd.DataFrame()

