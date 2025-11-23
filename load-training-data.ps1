# Скрипт для загрузки данных обучения через API
# Использование: .\load-training-data.ps1

$apiUrl = "http://localhost:3000/api/data/upload"
$dataDir = "ml-service\data"

Write-Host "Загрузка данных для обучения..." -ForegroundColor Cyan

# Функция для загрузки файла
function Upload-File {
    param(
        [string]$FilePath,
        [string]$FileType
    )
    
    $fileName = Split-Path $FilePath -Leaf
    Write-Host "Загрузка: $fileName (тип: $FileType)" -ForegroundColor Yellow
    
    try {
        $form = @{
            file = Get-Item $FilePath
            fileType = $FileType
        }
        
        $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Form $form -ContentType "multipart/form-data"
        
        if ($response.success) {
            Write-Host "✓ $fileName загружен успешно (ID: $($response.data.id))" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ Ошибка загрузки $fileName : $($response.message)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "✗ Ошибка при загрузке $fileName : $_" -ForegroundColor Red
        return $false
    }
}

# Загружаем файлы в правильном порядке
$files = @(
    @{Path = "$dataDir\supplies.csv"; Type = "SUPPLIES"},
    @{Path = "$dataDir\temperature.csv"; Type = "TEMPERATURE"},
    @{Path = "$dataDir\fires.csv"; Type = "FIRES"}
)

# Загружаем погодные данные (можно объединить или загрузить отдельно)
$weatherFiles = Get-ChildItem "$dataDir\weather_data_*.csv"

Write-Host "`nЗагрузка основных данных..." -ForegroundColor Cyan
foreach ($file in $files) {
    if (Test-Path $file.Path) {
        Upload-File -FilePath $file.Path -FileType $file.Type
        Start-Sleep -Seconds 2  # Небольшая задержка между загрузками
    } else {
        Write-Host "⚠ Файл не найден: $($file.Path)" -ForegroundColor Yellow
    }
}

Write-Host "`nЗагрузка погодных данных..." -ForegroundColor Cyan
# Для погодных данных можно загрузить первый файл как пример
# В реальности нужно объединить все файлы или загрузить каждый
if ($weatherFiles.Count -gt 0) {
    Write-Host "Найдено $($weatherFiles.Count) файлов погодных данных" -ForegroundColor Yellow
    Write-Host "Загружаем первый файл как пример..." -ForegroundColor Yellow
    Upload-File -FilePath $weatherFiles[0].FullName -FileType "WEATHER"
}

Write-Host "`n✓ Загрузка данных завершена!" -ForegroundColor Green
Write-Host "`nПроверьте статус загрузок через:" -ForegroundColor Cyan
Write-Host "  curl http://localhost:3000/api/data/uploads" -ForegroundColor Gray

