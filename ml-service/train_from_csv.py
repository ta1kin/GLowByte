"""
Скрипт для обучения модели напрямую из CSV файлов
Использует логику из model.ipynb
"""
import sys
import os
import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, f1_score, accuracy_score, precision_score, recall_score
import xgboost as xgb
import json
from pathlib import Path

# Добавляем путь к src
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.model_manager import model_manager

def load_and_preprocess_data(data_dir: str = "data"):
    """
    Загрузить и предобработать данные из CSV файлов
    """
    print("📂 Загрузка данных из CSV файлов...")
    
    data_path = Path(__file__).parent / data_dir
    
    # 1. Загрузка данных
    print("  Загрузка fires.csv...")
    fires = pd.read_csv(data_path / 'fires.csv')
    # Переименовываем колонки для совместимости с логикой из model.ipynb
    fires = fires.rename(columns={
        'Груз': 'Марка',
        'Дата начала': 'Дата возгорания',
        'Нач.форм.штабеля': 'Формирование штабеля'
    })
    
    print("  Загрузка temperature.csv...")
    temp = pd.read_csv(data_path / 'temperature.csv')
    
    print("  Загрузка supplies.csv...")
    supplies = pd.read_csv(data_path / 'supplies.csv')
    # Переименовываем колонки для совместимости
    supplies = supplies.rename(columns={
        'ВыгрузкаНаСклад': 'Дата поступления',
        'Наим. ЕТСНГ': 'Марка',
        'ПогрузкаНаСудно': 'Дата отправления'
    })
    
    print("  Загрузка погодных данных...")
    # Объединяем все файлы погоды
    weather_files = list(data_path.glob('weather_data_*.csv'))
    if not weather_files:
        print("  ⚠ Погодные файлы не найдены, используем пустой датафрейм")
        weather = pd.DataFrame(columns=['datetime', 'temp_air', 'pressure', 'humidity', 'precip', 'wind'])
    else:
        weather_dfs = []
        for wf in sorted(weather_files):
            print(f"    Загрузка {wf.name}...")
            try:
                # Погодные файлы имеют заголовки
                df = pd.read_csv(wf)
                # Переименовываем колонки для совместимости
                df = df.rename(columns={
                    'date': 'datetime',
                    't': 'temp_air',
                    'p': 'pressure',
                    'precipitation': 'precip'
                })
                # Выбираем нужные колонки
                if 'datetime' in df.columns:
                    weather_dfs.append(df[['datetime', 'temp_air', 'pressure', 'humidity', 'precip']].copy())
            except Exception as e:
                print(f"    ⚠ Ошибка при загрузке {wf.name}: {e}")
        weather = pd.concat(weather_dfs, ignore_index=True) if weather_dfs else pd.DataFrame()
    
    print(f"✓ Данные загружены: fires={len(fires)}, temp={len(temp)}, supplies={len(supplies)}, weather={len(weather)}")
    
    # 2. Преобразование дат
    print("\n📅 Преобразование дат...")
    fires['date_fire'] = pd.to_datetime(fires['Дата возгорания'], errors='coerce')
    fires = fires.dropna(subset=['date_fire'])
    
    temp['date'] = pd.to_datetime(temp['Дата акта'], errors='coerce')
    temp = temp.dropna(subset=['date'])
    
    supplies['stack_start_date'] = pd.to_datetime(supplies['Дата поступления'], errors='coerce')
    supplies = supplies.dropna(subset=['stack_start_date'])
    
    # 3. Создание stack_id
    print("  Создание stack_id...")
    temp['stack_id'] = temp['Склад'].astype(str) + '_' + temp['Штабель'].astype(str)
    fires['stack_id'] = fires['Склад'].astype(str) + '_' + fires['Штабель'].astype(str)
    
    # Приведём даты к .date()
    fires['date_fire'] = fires['date_fire'].dt.date
    temp['date'] = temp['date'].dt.date
    
    # 4. Метка: возгорание в окне ±2 дня
    print("  Создание целевой переменной (target)...")
    fire_events = set(zip(fires['stack_id'], fires['date_fire']))
    
    def has_fire_in_window(row):
        for delta in range(-2, 3):  # -2, -1, 0, +1, +2
            candidate = row['date'] + timedelta(days=delta)
            if (row['stack_id'], candidate) in fire_events:
                return 1
        return 0
    
    temp['target'] = temp.apply(has_fire_in_window, axis=1)
    print(f"  Целевая переменная создана: {temp['target'].sum()} возгораний из {len(temp)} записей")
    
    # 5. Возраст штабеля
    print("  Расчет возраста штабелей...")
    supply_start = supplies.groupby(['Склад', 'Штабель'])['stack_start_date'].min().reset_index()
    supply_start['stack_id'] = supply_start['Склад'].astype(str) + '_' + supply_start['Штабель'].astype(str)
    stack_age_map = dict(zip(supply_start['stack_id'], supply_start['stack_start_date']))
    
    temp['stack_start'] = temp['stack_id'].map(stack_age_map)
    temp['stack_start'] = pd.to_datetime(temp['stack_start']).dt.date
    temp['age_days'] = (pd.to_datetime(temp['date']) - pd.to_datetime(temp['stack_start'])).dt.days
    temp['age_days'] = temp['age_days'].clip(lower=0).fillna(0)
    
    # 6. Погода: агрегация до дня
    print("  Обработка погодных данных...")
    if not weather.empty:
        weather['date'] = pd.to_datetime(weather['datetime']).dt.date
        weather_daily = weather.groupby('date').agg({
            'temp_air': 'max',
            'humidity': 'mean',
            'precip': 'sum'
        }).reset_index()
        
        # Присоединяем погоду по дате
        temp = temp.merge(weather_daily[['date', 'temp_air', 'humidity', 'precip']], on='date', how='left')
    else:
        print("  ⚠ Погодные данные отсутствуют, используем значения по умолчанию")
        temp['temp_air'] = 20.0
        temp['humidity'] = 60.0
        temp['precip'] = 0.0
    
    # 7. Динамика температуры: рост за 3 дня
    print("  Расчет динамики температуры...")
    temp = temp.sort_values(['stack_id', 'date']).reset_index(drop=True)
    temp['temp_lag3'] = temp.groupby('stack_id')['Максимальная температура'].shift(3)
    temp['temp_delta_3d'] = temp['Максимальная температура'] - temp['temp_lag3']
    temp['temp_delta_3d'] = temp['temp_delta_3d'].fillna(0)
    
    # 8. Подготовка финального датасета
    print("  Подготовка финального датасета...")
    temp = temp.dropna(subset=['Максимальная температура'])
    
    # Заполнение пропусков в погоде
    for col in ['temp_air', 'humidity', 'precip']:
        if col in temp.columns:
            temp[col] = temp[col].ffill().bfill().fillna(20.0 if col == 'temp_air' else (60.0 if col == 'humidity' else 0.0))
    
    print(f"✓ Предобработка завершена: {len(temp)} записей")
    return temp


def train_model(data_dir: str = "data", model_name: str = "coal_fire_model", model_version: str = "1.0.1"):
    """
    Обучить модель на данных из CSV
    """
    print(f"\n🚀 Начало обучения модели {model_name} v{model_version}")
    print("=" * 60)
    
    # Загрузка и предобработка данных
    temp = load_and_preprocess_data(data_dir)
    
    # Подготовка признаков
    feature_cols = [
        'Максимальная температура',
        'age_days',
        'temp_air',
        'humidity',
        'precip',
        'temp_delta_3d'
    ]
    
    print(f"\n📊 Подготовка признаков: {feature_cols}")
    X = temp[feature_cols]
    y = temp['target']
    
    # Удаляем строки с NaN
    mask = X.notnull().all(axis=1) & y.notnull()
    X = X[mask]
    y = y[mask]
    
    if len(X) == 0:
        raise ValueError("Нет валидных данных для обучения после предобработки")
    
    print(f"✓ Валидных записей: {len(X)}")
    print(f"  Положительных примеров (возгорания): {y.sum()} ({y.sum()/len(y)*100:.2f}%)")
    print(f"  Отрицательных примеров: {len(y) - y.sum()} ({(len(y) - y.sum())/len(y)*100:.2f}%)")
    
    # Разделение на train/test
    print("\n📦 Разделение на train/test (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    print(f"  Train: {len(X_train)} записей")
    print(f"  Test: {len(X_test)} записей")
    
    # Расчет scale_pos_weight для несбалансированных классов
    scale_pos_weight = sum(y_train == 0) / sum(y_train == 1) if sum(y_train == 1) > 0 else 1.0
    print(f"  scale_pos_weight: {scale_pos_weight:.2f}")
    
    # Обучение модели
    print("\n🎓 Обучение XGBoost модели...")
    model = xgb.XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    print("✓ Модель обучена")
    
    # Оценка модели
    print("\n📈 Оценка модели...")
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, pos_label=1, zero_division=0)
    recall = recall_score(y_test, y_pred, pos_label=1, zero_division=0)
    f1 = f1_score(y_test, y_pred, pos_label=1, zero_division=0)
    
    print(f"  Accuracy: {accuracy:.4f}")
    print(f"  Precision: {precision:.4f}")
    print(f"  Recall: {recall:.4f}")
    print(f"  F1-score: {f1:.4f}")
    
    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred))
    
    # Важность признаков
    print("\n🔍 Важность признаков:")
    importance = model.feature_importances_
    feat_imp = pd.DataFrame({
        'feature': feature_cols,
        'importance': importance
    }).sort_values('importance', ascending=False)
    print(feat_imp.to_string(index=False))
    
    # Сохранение модели
    print(f"\n💾 Сохранение модели...")
    models_dir = Path(__file__).parent / 'models'
    models_dir.mkdir(exist_ok=True)
    
    model_path = model_manager.save_model(
        model,
        model_name,
        model_version,
        metadata={
            "training_samples": len(X_train),
            "test_samples": len(X_test),
            "training_date": pd.Timestamp.now().isoformat(),
            "hyperparams": {
                "n_estimators": 300,
                "max_depth": 6,
                "learning_rate": 0.1,
                "scale_pos_weight": scale_pos_weight,
            },
            "metrics": {
                "accuracy": float(accuracy),
                "precision": float(precision),
                "recall": float(recall),
                "f1_score": float(f1),
            },
            "feature_importance": dict(zip(feature_cols, importance.tolist())),
        },
    )
    
    print(f"✓ Модель сохранена: {model_path}")
    
    # Попытка загрузить модель для проверки
    print(f"\n🔄 Проверка загрузки модели...")
    if model_manager.load_model(model_name, model_version):
        print(f"✓ Модель успешно загружена")
        model_info = model_manager.get_model_info()
        print(f"  Информация о модели: {json.dumps(model_info, indent=2, default=str)}")
    else:
        print("⚠ Не удалось загрузить модель после сохранения")
    
    print("\n" + "=" * 60)
    print("✅ Обучение модели завершено успешно!")
    print(f"   Модель: {model_name} v{model_version}")
    print(f"   Путь: {model_path}")
    print(f"   Метрики: F1={f1:.4f}, Accuracy={accuracy:.4f}")
    
    return {
        "success": True,
        "model_path": str(model_path),
        "metrics": {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
        },
        "training_samples": len(X_train),
        "test_samples": len(X_test),
    }


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Обучение модели из CSV файлов')
    parser.add_argument('--data-dir', type=str, default='data', help='Директория с CSV файлами')
    parser.add_argument('--model-name', type=str, default='coal_fire_model', help='Название модели')
    parser.add_argument('--model-version', type=str, default='1.0.1', help='Версия модели')
    
    args = parser.parse_args()
    
    try:
        result = train_model(
            data_dir=args.data_dir,
            model_name=args.model_name,
            model_version=args.model_version
        )
        print(f"\n🎉 Результат: {json.dumps(result, indent=2, default=str)}")
    except Exception as e:
        print(f"\n❌ Ошибка при обучении: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

