# Скрипт для загрузки данных обучения через API
param(
    [string]$ApiUrl = "http://localhost:3000",
    [string]$Token = ""
)

$dataDir = "ml-service\data"
$files = @(
    @{Path = "$dataDir\temperature.csv"; Type = "TEMPERATURE"},
    @{Path = "$dataDir\supplies.csv"; Type = "SUPPLIES"},
    @{Path = "$dataDir\fires.csv"; Type = "FIRES"},
    @{Path = "$dataDir\weather_data_2015.csv"; Type = "WEATHER"},
    @{Path = "$dataDir\weather_data_2016.csv"; Type = "WEATHER"},
    @{Path = "$dataDir\weather_data_2017.csv"; Type = "WEATHER"},
    @{Path = "$dataDir\weather_data_2018.csv"; Type = "WEATHER"},
    @{Path = "$dataDir\weather_data_2019.csv"; Type = "WEATHER"},
    @{Path = "$dataDir\weather_data_2020.csv"; Type = "WEATHER"},
    @{Path = "$dataDir\weather_data_2021.csv"; Type = "WEATHER"}
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Загрузка данных для обучения модели" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$headers = @{
    "Content-Type" = "multipart/form-data"
}

if ($Token) {
    $headers["Authorization"] = "Bearer $Token"
}

$successCount = 0
$failCount = 0

foreach ($fileInfo in $files) {
    $filePath = $fileInfo.Path
    $fileType = $fileInfo.Type
    
    if (-not (Test-Path $filePath)) {
        Write-Host "⚠ Файл не найден: $filePath" -ForegroundColor Yellow
        $failCount++
        continue
    }
    
    Write-Host "`n📤 Загрузка: $(Split-Path $filePath -Leaf) (тип: $fileType)" -ForegroundColor Cyan
    
    try {
        $form = @{
            file = Get-Item $filePath
            fileType = $fileType
        }
        
        $response = Invoke-RestMethod -Uri "$ApiUrl/data/upload" -Method Post -Form $form -Headers $headers -ErrorAction Stop
        
        if ($response.success) {
            Write-Host "✅ Успешно загружено: $($response.data.filename)" -ForegroundColor Green
            Write-Host "   ID загрузки: $($response.data.id), Статус: $($response.data.status)" -ForegroundColor Gray
            $successCount++
        } else {
            Write-Host "❌ Ошибка: $($response.message)" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "❌ Ошибка при загрузке: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "   Детали: $($_.ErrorDetails.Message)" -ForegroundColor Gray
        }
        $failCount++
    }
    
    # Небольшая задержка между загрузками
    Start-Sleep -Seconds 1
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Результаты загрузки:" -ForegroundColor Cyan
Write-Host "  ✅ Успешно: $successCount" -ForegroundColor Green
Write-Host "  ❌ Ошибок: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Gray" })
Write-Host "=========================================" -ForegroundColor Cyan

if ($successCount -gt 0) {
    Write-Host "`n⏳ Ожидание обработки файлов..." -ForegroundColor Yellow
    Write-Host "   Проверьте статус загрузок через: GET $ApiUrl/data/uploads" -ForegroundColor Gray
    Write-Host "`n💡 После обработки всех файлов можно обучить модель:" -ForegroundColor Cyan
    Write-Host "   POST $ApiUrl/ml/train" -ForegroundColor Gray
    Write-Host "   {`"model_name`": `"coal_fire_model`", `"model_version`": `"1.0.1`"}" -ForegroundColor Gray
}

