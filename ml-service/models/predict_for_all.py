import pandas as pd
import numpy as np
import xgboost as xgb
import json
import os
from datetime import datetime, timedelta


def predict_all_risks(
        target_date: str = None,
        model_path: str = "coal_fire_model.json",
        data_dir: str = "data",
        output_json: str = "high_risk_stacks.json",
        threshold: float = 0.5
) -> dict:
    """
    Предсказывает риск самовозгорания для всех штабелей на заданную дату.

    Возвращает словарь вида:
    {
        "date": "2020-08-05",
        "high_risk_stacks": [
            {
                "Склад": 6,
                "Штабель": 4,
                "Марка": "A1",
                "Максимальная температура": 243.1,
                "Вероятность_возгорания": 0.98,
                "Предсказание": 1
            },
            ...
        ]
    }
    Также сохраняет результат в output_json.
    """
    # --- Загрузка модели ---
    model = xgb.XGBClassifier()
    model.load_model(model_path)

    # --- Загрузка данных ---
    temp = pd.read_csv(os.path.join(data_dir, 'temprerature_agr.csv'))
    supplies = pd.read_csv(os.path.join(data_dir, 'supplies_agr.csv'), header=None)
    supplies.columns = ['Дата поступления', 'Марка', 'Склад', 'Дата отправления', 'Штабель']
    weather = pd.read_csv(os.path.join(data_dir, 'weather_agr.csv'), header=None)
    weather.columns = ['datetime', 'temp_air', 'pressure', 'humidity', 'precip', 'wind']

    # --- Определение даты ---
    if target_date is None:
        # Берём последнюю дату из температурных замеров
        temp['date_parsed'] = pd.to_datetime(temp['Дата акта'], errors='coerce')
        latest_date = temp['date_parsed'].max()
        target_date_dt = latest_date.date()
        target_date = latest_date.strftime('%Y-%m-%d')
    else:
        target_date_dt = datetime.strptime(target_date, "%Y-%m-%d").date()

    # --- Фильтрация замеров на target_date ---
    temp['date'] = pd.to_datetime(temp['Дата акта']).dt.date
    temp_today = temp[temp['date'] == target_date_dt].copy()
    if temp_today.empty:
        raise ValueError(f"Нет данных о температуре на дату {target_date}")

    # --- Возраст штабелей ---
    supplies['Дата поступления'] = pd.to_datetime(supplies['Дата поступления'], errors='coerce')
    supplies['stack_id'] = supplies['Склад'].astype(str) + '_' + supplies['Штабель'].astype(str)
    stack_start_map = supplies.groupby('stack_id')['Дата поступления'].min()

    temp_today['stack_id'] = temp_today['Склад'].astype(str) + '_' + temp_today['Штабель'].astype(str)
    temp_today['stack_start'] = temp_today['stack_id'].map(stack_start_map)
    temp_today['age_days'] = (pd.to_datetime(target_date_dt) - pd.to_datetime(temp_today['stack_start'])).dt.days
    temp_today['age_days'] = temp_today['age_days'].clip(lower=0).fillna(0)

    # --- Погода ---
    weather['datetime'] = pd.to_datetime(weather['datetime'], errors='coerce')
    weather['date'] = weather['datetime'].dt.date
    weather_daily = weather.groupby('date').agg({
        'temp_air': 'max',
        'humidity': 'mean',
        'precip': 'sum'
    }).reset_index()

    weather_row = weather_daily[weather_daily['date'] == target_date_dt]
    if weather_row.empty:
        temp_air = weather_daily['temp_air'].max()
        humidity = weather_daily['humidity'].mean()
        precip = weather_daily['precip'].sum()
    else:
        temp_air = weather_row['temp_air'].iloc[0]
        humidity = weather_row['humidity'].iloc[0]
        precip = weather_row['precip'].iloc[0]

    temp_today['temp_air'] = temp_air
    temp_today['humidity'] = humidity
    temp_today['precip'] = precip

    # --- Динамика температуры (temp_delta_3d) ---
    temp_full = temp.copy()
    temp_full['stack_id'] = temp_full['Склад'].astype(str) + '_' + temp_full['Штабель'].astype(str)
    temp_full['date_full'] = pd.to_datetime(temp_full['Дата акта']).dt.date

    def get_temp_3d_ago(row):
        three_days_ago = target_date_dt - timedelta(days=3)
        hist = temp_full[
            (temp_full['stack_id'] == row['stack_id']) &
            (temp_full['date_full'] >= three_days_ago) &
            (temp_full['date_full'] < target_date_dt)
            ]
        if hist.empty:
            return row['Максимальная температура']
        else:
            return hist.sort_values('date_full').iloc[-1]['Максимальная температура']

    temp_today['temp_lag3'] = temp_today.apply(get_temp_3d_ago, axis=1)
    temp_today['temp_delta_3d'] = temp_today['Максимальная температура'] - temp_today['temp_lag3']

    # --- Предсказание ---
    feature_cols = [
        'Максимальная температура',
        'age_days',
        'temp_air',
        'humidity',
        'precip',
        'temp_delta_3d'
    ]

    X = temp_today[feature_cols]
    proba = model.predict_proba(X)[:, 1]
    pred = (proba >= threshold).astype(int)

    # --- Формируем результат ---
    temp_today['Вероятность_возгорания'] = proba
    temp_today['Предсказание'] = pred

    high_risk = temp_today[temp_today['Предсказание'] == 1].copy()

    # Выбираем только нужные поля
    result_records = high_risk[[
        'Склад', 'Штабель', 'Марка', 'Максимальная температура',
        'Вероятность_возгорания', 'Предсказание'
    ]].to_dict(orient='records')

    output = {
        "date": target_date,
        "high_risk_stacks": result_records
    }

    # --- Сохранение в JSON ---
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    return output

# Предсказать на последнюю доступную дату
result = predict_all_risks()

print(f"Дата: {result['date']}")
print(f"Найдено {len(result['high_risk_stacks'])} штабелей с риском возгорания")
for item in result['high_risk_stacks']:
    print(f"  Склад {item['Склад']}, Штабель {item['Штабель']}: "
          f"T={item['Максимальная температура']}°C, "
          f"P={item['Вероятность_возгорания']:.2f}")