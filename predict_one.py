from datetime import timedelta

import pandas as pd
import xgboost as xgb


"""
    Предсказывает, загорится ли указанный штабель в интервале [date - 2 дня, date + 2 дня].

    Возвращает словарь:
    {
        "stack_id": "6_1",
        "date": "2025-04-05",
        "predicted": 1,
        "probability": 0.92
    }
    """


def predict_spontaneous_combustion(
        stack_id: str,  # Например: "6_1"
        date: str,  # Дата в формате "YYYY-MM-DD"
        current_temp: float,  # Текущая максимальная температура в штабеле
        data_dir: str = "data",  # Папка с исходными CSV
        model_path: str = "coal_fire_model.json"
) -> dict:

    #  Загрузка вспомогательных данных
    try:
        supplies = pd.read_csv(f"{data_dir}/supplies_agr.csv", header=None)
        supplies.columns = ['Дата поступления', 'Марка', 'Склад', 'Дата отправления', 'Штабель']
        supplies['stack_id'] = supplies['Склад'].astype(str) + '_' + supplies['Штабель'].astype(str)
        supplies['Дата поступления'] = pd.to_datetime(supplies['Дата поступления'], errors='coerce')
        stack_start = supplies.loc[supplies['stack_id'] == stack_id, 'Дата поступления'].min()
        if pd.isna(stack_start):
            raise ValueError(f"Не найдена дата формирования штабеля {stack_id}")
        age_days = (pd.to_datetime(date) - stack_start).days
        if age_days < 0:
            age_days = 0
    except Exception as e:
        raise ValueError(f"Ошибка при расчёте возраста штабеля: {e}")

    #  Погода
    try:
        weather = pd.read_csv(f"{data_dir}/weather_agr.csv", header=None)
        weather.columns = ['datetime', 'temp_air', 'pressure', 'humidity', 'precip', 'wind']
        weather['date'] = pd.to_datetime(weather['datetime']).dt.date
        weather_daily = weather.groupby('date').agg({
            'temp_air': 'max',
            'humidity': 'mean',
            'precip': 'sum'
        }).reset_index()
        weather_row = weather_daily[weather_daily['date'] == pd.to_datetime(date).date()]
        if weather_row.empty:
            # Используем средние значения по всему периоду, если погода не найдена
            temp_air = weather_daily['temp_air'].max()
            humidity = weather_daily['humidity'].mean()
            precip = weather_daily['precip'].sum()
        else:
            temp_air = weather_row['temp_air'].iloc[0]
            humidity = weather_row['humidity'].iloc[0]
            precip = weather_row['precip'].iloc[0]
    except Exception as e:
        raise ValueError(f"Ошибка при загрузке погоды: {e}")

    #  Динамика температуры (temp_delta_3d)
    try:
        temp_hist = pd.read_csv(f"{data_dir}/temprerature_agr.csv")
        temp_hist['stack_id'] = temp_hist['Склад'].astype(str) + '_' + temp_hist['Штабель'].astype(str)
        temp_hist['date'] = pd.to_datetime(temp_hist['Дата акта']).dt.date

        #  Берём замеры за последние 3 дня до текущей даты
        target_date = pd.to_datetime(date).date()
        three_days_ago = target_date - timedelta(days=3)
        recent = temp_hist[
            (temp_hist['stack_id'] == stack_id) &
            (temp_hist['date'] >= three_days_ago) &
            (temp_hist['date'] < target_date)
            ]
        if recent.empty:
            temp_lag3 = current_temp  # нет истории → delta = 0
        else:
            temp_lag3 = recent.sort_values('date').iloc[-1]['Максимальная температура']
        temp_delta_3d = current_temp - temp_lag3
    except Exception as e:
        temp_delta_3d = 0.0  # по умолчанию

    #  Формируем вектор признаков
    features = pd.DataFrame([{
        'Максимальная температура': current_temp,
        'age_days': age_days,
        'temp_air': temp_air,
        'humidity': humidity,
        'precip': precip,
        'temp_delta_3d': temp_delta_3d
    }])

    #  Загружаем модель и предсказываем
    try:
        model = xgb.XGBClassifier()
        model.load_model(model_path)
        proba = model.predict_proba(features)[0][1]
        pred = int(proba >= 0.5)
    except Exception as e:
        raise RuntimeError(f"Ошибка при загрузке модели или предсказании: {e}")

    return {
        "stack_id": stack_id,
        "date": date,
        "predicted": pred,
        "probability": float(proba)
    }
