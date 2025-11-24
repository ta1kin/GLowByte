import pandas as pd
import xgboost as xgb
from sklearn.metrics import classification_report, f1_score
from sklearn.model_selection import train_test_split


def get_prediction(temp: pd.DataFrame):
    feature_cols = [
        'Максимальная температура',
        'age_days',
        'temp_air',
        'humidity',
        'precip',
        'temp_delta_3d'
    ]

    X = temp[feature_cols]
    y = temp['target']

    #  Удаляем строки с оставшимися NaN
    mask = X.notnull().all(axis=1)
    X = X[mask]
    y = y[mask]

    #  Обучение модели
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    scale_pos_weight = sum(y == 0) / sum(y == 1)

    model = xgb.XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric='logloss'
    )
    model.fit(X_train, y_train)

    #  Оценка
    y_pred = model.predict(X_test)
    print("F1-score (по классу 'возгорание'):", f1_score(y_test, y_pred, pos_label=1))
    print("\nClassification Report:\n", classification_report(y_test, y_pred))

    #  Важность признаков
    importance = model.feature_importances_
    feat_imp = pd.DataFrame({
        'feature': feature_cols,
        'importance': importance
    }).sort_values('importance', ascending=False)

    print("\nВажность признаков:")
    print(feat_imp)

    #  Предсказания: вероятности и бинарный результат

    X_final = temp[mask][feature_cols]
    y_proba = model.predict_proba(X_final)[:, 1]  # вероятность класса "возгорание"
    y_pred_final = (y_proba >= 0.5).astype(int)

    # Формируем результат
    result_df = temp[mask][['Склад', 'Штабель', 'Марка', 'Дата акта', 'Максимальная температура']].copy()
    result_df['Вероятность_возгорания'] = y_proba
    result_df['Предсказание'] = y_pred_final

    # Выводим первые 10 предсказаний на экран
    print("\n Первые 10 предсказаний:")
    print(result_df.head(10).to_string(index=False))

    #  Сохранение в JSON для API
    #  Преобразуем дату в строку
    result_df['Дата'] = pd.to_datetime(result_df['Дата акта']).dt.strftime('%Y-%m-%d')

    # Выбираем итоговые колонки
    output_json = result_df[[
        'Склад', 'Штабель', 'Марка', 'Дата',
        'Максимальная температура', 'Вероятность_возгорания', 'Предсказание'
    ]].to_dict(orient='records')

    # Сохраняем в JSON
    import json
    with open('C:\\Users\\Dobby\\Downloads\\data\\coal_fire_predictions.json', 'w', encoding='utf-8') as f:
        json.dump(output_json, f, ensure_ascii=False, indent=2)

    print("\n Предсказания сохранены в 'coal_fire_predictions.json'")
    print("Пример записи для API:")
    print(json.dumps(output_json[0] if output_json else {}, ensure_ascii=False, indent=2))
    return ...
