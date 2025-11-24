# Скрипт для прогнозирования на основе CSV файлов (fires, supplies, temperature)
# Использование: .\predict-from-csv.ps1 -FiresFile "fires.csv" -SuppliesFile "supplies.csv" -TemperatureFile "temperature.csv" -MlServiceUrl "http://your-vps:8000"

param(
    [Parameter(Mandatory=$true)]
    [string]$FiresFile,
    
    [Parameter(Mandatory=$true)]
    [string]$SuppliesFile,
    
    [Parameter(Mandatory=$true)]
    [string]$TemperatureFile,
    
    [Parameter(Mandatory=$false)]
    [string]$WeatherFile = $null,
    
    [Parameter(Mandatory=$false)]
    [string]$MlServiceUrl = "http://localhost:8000",
    
    [Parameter(Mandatory=$false)]
    [int]$HorizonDays = 7
)

Write-Host "=== Прогнозирование на основе CSV файлов ===" -ForegroundColor Cyan
Write-Host ""

# Проверяем существование файлов
$files = @{
    "fires" = $FiresFile
    "supplies" = $SuppliesFile
    "temperature" = $TemperatureFile
}

if ($WeatherFile) {
    $files["weather"] = $WeatherFile
}

foreach ($name in $files.Keys) {
    $file = $files[$name]
    if (-not (Test-Path $file)) {
        Write-Host "Ошибка: Файл не найден: $file ($name)" -ForegroundColor Red
        exit 1
    }
    Write-Host "$name : $file" -ForegroundColor Green
}

Write-Host "ML Service URL: $MlServiceUrl" -ForegroundColor Green
Write-Host "Горизонт прогнозирования: $HorizonDays дней" -ForegroundColor Green

# Формируем URL
$url = "$MlServiceUrl/predict/csv?horizon_days=$HorizonDays"

Write-Host ""
Write-Host "Отправка запроса на прогнозирование..." -ForegroundColor Yellow

try {
    # Используем curl для отправки multipart/form-data
    $curlArgs = @(
        "-X", "POST",
        "-F", "fires=@$FiresFile",
        "-F", "supplies=@$SuppliesFile",
        "-F", "temperature=@$TemperatureFile"
    )
    
    if ($WeatherFile) {
        $curlArgs += "-F", "weather=@$WeatherFile"
    }
    
    $curlArgs += $url
    
    $curlOutput = & curl @curlArgs 2>&1
    $response = $curlOutput | ConvertFrom-Json
    
    # Если curl недоступен или произошла ошибка, используем альтернативный метод
    if (-not $response -or $LASTEXITCODE -ne 0) {
        Write-Host "Попытка использовать альтернативный метод..." -ForegroundColor Yellow
        
        # Используем Invoke-WebRequest с multipart/form-data
        $boundary = [System.Guid]::NewGuid().ToString()
        $bodyParts = @()
        
        # Добавляем файлы
        $filesToAdd = @(
            @{name="fires"; path=$FiresFile},
            @{name="supplies"; path=$SuppliesFile},
            @{name="temperature"; path=$TemperatureFile}
        )
        
        if ($WeatherFile) {
            $filesToAdd += @{name="weather"; path=$WeatherFile}
        }
        
        foreach ($fileInfo in $filesToAdd) {
            $fileContent = Get-Content $fileInfo.path -Raw -Encoding UTF8
            $fileName = [System.IO.Path]::GetFileName($fileInfo.path)
            
            $bodyParts += "--$boundary"
            $bodyParts += "Content-Disposition: form-data; name=`"$($fileInfo.name)`"; filename=`"$fileName`""
            $bodyParts += "Content-Type: text/csv"
            $bodyParts += ""
            $bodyParts += $fileContent
        }
        
        $bodyParts += "--$boundary--"
        $body = $bodyParts -join "`r`n"
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
        
        $headers = @{
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        }
        
        $webResponse = Invoke-WebRequest -Uri $url -Method Post -Body $bodyBytes -Headers $headers
        $response = $webResponse.Content | ConvertFrom-Json
    }
    
    Write-Host ""
    Write-Host "=== Результаты прогнозирования ===" -ForegroundColor Cyan
    Write-Host ""
    
    if ($response.success) {
        Write-Host "✓ Прогнозирование выполнено успешно!" -ForegroundColor Green
        Write-Host ""
        
        # Статистика
        if ($response.statistics) {
            Write-Host "--- Статистика ---" -ForegroundColor Yellow
            Write-Host "Всего прогнозов: $($response.statistics.total_predictions)" -ForegroundColor White
            Write-Host "Высокий риск: $($response.statistics.high_risk)" -ForegroundColor Red
            Write-Host "Средний риск: $($response.statistics.medium_risk)" -ForegroundColor Yellow
            Write-Host "Низкий риск: $($response.statistics.low_risk)" -ForegroundColor Green
            Write-Host "Средняя вероятность: $($response.statistics.avg_probability)" -ForegroundColor White
            Write-Host ""
        }
        
        # Информация о модели
        if ($response.model_info) {
            Write-Host "--- Информация о модели ---" -ForegroundColor Yellow
            Write-Host "Название: $($response.model_info.model_name)" -ForegroundColor White
            Write-Host "Версия: $($response.model_info.model_version)" -ForegroundColor White
            Write-Host ""
        }
        
        # Показываем первые несколько прогнозов
        if ($response.predictions) {
            Write-Host "--- Примеры прогнозов (первые 5) ---" -ForegroundColor Yellow
            $count = 0
            foreach ($pred in $response.predictions) {
                if ($count -ge 5) { break }
                Write-Host ""
                Write-Host "Штабель: $($pred.stack_id) (Склад: $($pred.sklad), Штабель: $($pred.shtabel))" -ForegroundColor Cyan
                Write-Host "  Уровень риска: $($pred.risk_level)" -ForegroundColor $(if ($pred.risk_level -in @("HIGH", "CRITICAL")) { "Red" } else { "White" })
                Write-Host "  Вероятность: $([math]::Round($pred.prob_event * 100, 2))%" -ForegroundColor White
                if ($pred.predicted_date) {
                    Write-Host "  Предсказанная дата: $($pred.predicted_date)" -ForegroundColor White
                    Write-Host "  Интервал: $($pred.interval_low) - $($pred.interval_high)" -ForegroundColor White
                } else {
                    Write-Host "  Возгорание не предсказано в пределах горизонта" -ForegroundColor Gray
                }
                $count++
            }
            Write-Host ""
        }
        
        # Сохраняем результат в JSON файл
        $outputFile = "predictions_result_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
        $response | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding UTF8
        Write-Host "Все результаты сохранены в: $outputFile" -ForegroundColor Green
        Write-Host "Всего прогнозов: $($response.predictions.Count)" -ForegroundColor Green
        
    } else {
        Write-Host "✗ Прогнозирование не выполнено" -ForegroundColor Red
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
    
    # Показываем вывод curl, если есть
    if ($curlOutput) {
        Write-Host "Вывод curl:" -ForegroundColor Yellow
        Write-Host $curlOutput -ForegroundColor Yellow
    }
    
    exit 1
}

Write-Host ""
Write-Host "=== Готово ===" -ForegroundColor Cyan

