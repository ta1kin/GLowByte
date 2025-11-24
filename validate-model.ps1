# Скрипт для валидации модели на тестовом CSV файле
# Использование: .\validate-model.ps1 -CsvFile "path/to/test.csv" -MlServiceUrl "http://your-vps:8000"

param(
    [Parameter(Mandatory=$true)]
    [string]$CsvFile,
    
    [Parameter(Mandatory=$false)]
    [string]$MlServiceUrl = "http://localhost:8000",
    
    [Parameter(Mandatory=$false)]
    [string]$ModelName = $null,
    
    [Parameter(Mandatory=$false)]
    [string]$ModelVersion = $null
)

Write-Host "=== Валидация модели на тестовом CSV файле ===" -ForegroundColor Cyan
Write-Host ""

# Проверяем существование файла
if (-not (Test-Path $CsvFile)) {
    Write-Host "Ошибка: Файл не найден: $CsvFile" -ForegroundColor Red
    exit 1
}

Write-Host "Файл: $CsvFile" -ForegroundColor Green
Write-Host "ML Service URL: $MlServiceUrl" -ForegroundColor Green

# Формируем URL с query параметрами
$url = "$MlServiceUrl/validate"
$queryParams = @()
if ($ModelName) {
    $queryParams += "model_name=$ModelName"
}
if ($ModelVersion) {
    $queryParams += "model_version=$ModelVersion"
}
if ($queryParams.Count -gt 0) {
    $url += "?" + ($queryParams -join "&")
}

Write-Host ""
Write-Host "Отправка запроса на валидацию..." -ForegroundColor Yellow

try {
    # Используем curl для отправки multipart/form-data (более надежно)
    $curlArgs = @(
        "-X", "POST",
        "-F", "file=@$CsvFile",
        $url
    )
    
    $curlOutput = & curl @curlArgs 2>&1
    $response = $curlOutput | ConvertFrom-Json
    
    # Если curl недоступен, используем альтернативный метод
    if (-not $response -or $LASTEXITCODE -ne 0) {
        Write-Host "Попытка использовать альтернативный метод..." -ForegroundColor Yellow
        
        # Используем Invoke-WebRequest с multipart/form-data
        $fileContent = Get-Content $CsvFile -Raw -Encoding UTF8
        $boundary = [System.Guid]::NewGuid().ToString()
        $fileName = [System.IO.Path]::GetFileName($CsvFile)
        
        $body = @"
--$boundary
Content-Disposition: form-data; name="file"; filename="$fileName"
Content-Type: text/csv

$fileContent
--$boundary--
"@
        
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
        $headers = @{
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        }
        
        $webResponse = Invoke-WebRequest -Uri $url -Method Post -Body $bodyBytes -Headers $headers
        $response = $webResponse.Content | ConvertFrom-Json
    }
    
    Write-Host ""
    Write-Host "=== Результаты валидации ===" -ForegroundColor Cyan
    Write-Host ""
    
    if ($response.success) {
        Write-Host "✓ Валидация выполнена успешно!" -ForegroundColor Green
        Write-Host ""
        
        # Выводим метрики
        if ($response.metrics) {
            Write-Host "--- Метрики классификации ---" -ForegroundColor Yellow
            if ($response.metrics.accuracy) {
                Write-Host "Accuracy: $($response.metrics.accuracy)" -ForegroundColor White
            }
            if ($response.metrics.precision) {
                Write-Host "Precision: $($response.metrics.precision)" -ForegroundColor White
            }
            if ($response.metrics.recall) {
                Write-Host "Recall: $($response.metrics.recall)" -ForegroundColor White
            }
            if ($response.metrics.f1_score) {
                Write-Host "F1-Score: $($response.metrics.f1_score)" -ForegroundColor White
            }
            Write-Host ""
            
            # Метрики для дат
            if ($response.metrics.date_metrics) {
                Write-Host "--- Метрики предсказания дат ---" -ForegroundColor Yellow
                Write-Host "MAE (дни): $($response.metrics.date_metrics.mae_days)" -ForegroundColor White
                Write-Host "RMSE (дни): $($response.metrics.date_metrics.rmse_days)" -ForegroundColor White
                Write-Host "Accuracy ±2 дня: $($response.metrics.date_metrics.accuracy_within_2d)%" -ForegroundColor White
                Write-Host "Accuracy ±3 дня: $($response.metrics.date_metrics.accuracy_within_3d)%" -ForegroundColor White
                Write-Host "Accuracy ±5 дня: $($response.metrics.date_metrics.accuracy_within_5d)%" -ForegroundColor White
                Write-Host ""
            }
            
            # Статистика предсказаний
            if ($response.metrics.predictions) {
                Write-Host "--- Статистика предсказаний ---" -ForegroundColor Yellow
                Write-Host "Всего образцов: $($response.metrics.total_samples)" -ForegroundColor White
                Write-Host "Положительных предсказаний: $($response.metrics.predictions.positive)" -ForegroundColor White
                Write-Host "Отрицательных предсказаний: $($response.metrics.predictions.negative)" -ForegroundColor White
                Write-Host "Средняя вероятность: $($response.metrics.predictions.avg_probability)" -ForegroundColor White
                Write-Host ""
            }
        }
        
        # Информация о модели
        if ($response.model_info) {
            Write-Host "--- Информация о модели ---" -ForegroundColor Yellow
            Write-Host "Название: $($response.model_info.model_name)" -ForegroundColor White
            Write-Host "Версия: $($response.model_info.model_version)" -ForegroundColor White
            Write-Host ""
        }
        
        # Сохраняем результат в JSON файл
        $outputFile = "validation_result_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        $response | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding UTF8
        Write-Host "Результаты сохранены в: $outputFile" -ForegroundColor Green
        
    } else {
        Write-Host "✗ Валидация не выполнена" -ForegroundColor Red
        Write-Host ($response | ConvertTo-Json -Depth 10)
    }
    
} catch {
    Write-Host ""
    Write-Host "Ошибка при выполнении запроса:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "Детали:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
    
    exit 1
}

Write-Host ""
Write-Host "=== Готово ===" -ForegroundColor Cyan

