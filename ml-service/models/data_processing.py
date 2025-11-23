from datetime import timedelta
import pandas as pd


#  Обработка файла с поставками
def supplies_processing(path_to_supplies: str) -> pd.DataFrame:
    supplies_df = pd.read_csv(path_to_supplies, header=None)
    supplies_df = supplies_df.drop(columns=['На склад, тн', 'На судно, тн'])
    supplies_df.columns = ['Дата поступления', 'Марка', 'Штабель', 'Дата отправления', 'Склад']
    supplies_df.to_csv('supplies_agr.csv', index=False)
    return supplies_df


#  Обработка файла с возгораниями
def fires_processing(path_to_fires: str) -> pd.DataFrame:
    fires_df = pd.read_csv(path_to_fires, header=None)
    fires_df = fires_df.drop(columns=['Дата составления', 'Вес по акту, тн', 'Дата оконч.'])
    fires_df.columns = ['Марка', 'Склад', 'Дата возгорания', 'Формирование штабеля', 'Штабель']
    fires_df.to_csv('fires_agr.csv', index=False)
    return fires_df


#  Обработка файла с температурами штабелей
def temperature_processing(path_to_temp: str) -> pd.DataFrame:
    temp_df = pd.read_csv(path_to_temp, header=None)
    temp_df = temp_df.drop(columns=['Пикет', 'Смена'])
    temp_df.to_csv('temperature_agr.csv', index=False)
    return temp_df


#  Обработка файла с погодными данными
def weather_processing(path_to_weather: str) -> pd.DataFrame:
    weather_df = pd.read_csv(path_to_weather, header=None)  # В случае неправильной обработки заголовка добавить
    # параметр skiprows=1
    weather_df = weather_df.drop(columns=['visibility', 'v_max', 'weather_code', 'v_avg', 'wind_dir'])
    weather_df.columns = ['datetime', 'temp_air', 'pressure', 'humidity', 'precip', 'wind']
    weather_df.to_csv('weather_agr.csv', index=False)
    return weather_df


#  Создание финального набора данных
def make_dataset(fires: pd.DataFrame, temp: pd.DataFrame, supplies: pd.DataFrame, weather: pd.DataFrame) -> pd.DataFrame:
    #  Преобразование дат с обработкой ошибок
    fires['date_fire'] = pd.to_datetime(fires['Дата возгорания'], errors='coerce')
    fires = fires.dropna(subset=['date_fire'])

    temp['date'] = pd.to_datetime(temp['Дата акта'], errors='coerce')
    temp = temp.dropna(subset=['date'])

    supplies['stack_start_date'] = pd.to_datetime(supplies['Дата поступления'], errors='coerce')
    supplies = supplies.dropna(subset=['stack_start_date'])

    #  Создание stack_id и нормализация типов
    temp['stack_id'] = temp['Склад'].astype(str) + '_' + temp['Штабель'].astype(str)
    fires['stack_id'] = fires['Склад'].astype(str) + '_' + fires['Штабель'].astype(str)

    # Приведём даты к .date()
    fires['date_fire'] = fires['date_fire'].dt.date
    temp['date'] = temp['date'].dt.date

    #  Метка: возгорание ТОГО ЖЕ штабеля в окне ±2 дня
    fire_events = set(zip(fires['stack_id'], fires['date_fire']))

    def has_fire_in_window(row):
        for delta in range(-2, 3):  # -2, -1, 0, +1, +2
            candidate = row['date'] + timedelta(days=delta)
            if (row['stack_id'], candidate) in fire_events:
                return 1
        return 0

    temp['target'] = temp.apply(has_fire_in_window, axis=1)

    #  Возраст штабеля (в днях)
    supply_start = supplies.groupby(['Склад', 'Штабель'])['stack_start_date'].min().reset_index()
    supply_start['stack_id'] = supply_start['Склад'].astype(str) + '_' + supply_start['Штабель'].astype(str)
    stack_age_map = dict(zip(supply_start['stack_id'], supply_start['stack_start_date']))

    temp['stack_start'] = temp['stack_id'].map(stack_age_map)
    temp['stack_start'] = pd.to_datetime(temp['stack_start']).dt.date
    temp['age_days'] = (pd.to_datetime(temp['date']) - pd.to_datetime(temp['stack_start'])).dt.days
    temp['age_days'] = temp['age_days'].clip(lower=0).fillna(0)

    #  Погода: агрегация до дня
    weather['date'] = pd.to_datetime(weather['datetime']).dt.date
    weather_daily = weather.groupby('date').agg({
        'temp_air': 'max',
        'humidity': 'mean',
        'precip': 'sum'
    }).reset_index()

    # Присоединяем погоду по дате
    temp = temp.merge(weather_daily[['date', 'temp_air', 'humidity', 'precip']], on='date', how='left')

    # Динамика температуры: рост за 3 дня
    temp = temp.sort_values(['stack_id', 'date']).reset_index(drop=True)
    temp['temp_lag3'] = temp.groupby('stack_id')['Максимальная температура'].shift(3)
    temp['temp_delta_3d'] = temp['Максимальная температура'] - temp['temp_lag3']
    temp['temp_delta_3d'] = temp['temp_delta_3d'].fillna(0)

    #  Подготовка финального датасета
    temp = temp.dropna(subset=['Максимальная температура'])

    # Заполнение пропусков в погоде
    for col in ['temp_air', 'humidity', 'precip']:
        temp[col] = temp[col].fillna(method='ffill').fillna(method='bfill')

    temp.to_csv('full_data_agr.csv', index=False)

    return temp
