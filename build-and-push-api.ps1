# Скрипт для сборки и загрузки образа API на DockerHub
# Использование: .\build-and-push-api.ps1 [DOCKER_USER]

param(
    [string]$DockerUser = $env:DOCKER_USER
)

if ([string]::IsNullOrEmpty($DockerUser)) {
    Write-Host "Ошибка: Укажите имя пользователя DockerHub" -ForegroundColor Red
    Write-Host "Использование: .\build-and-push-api.ps1 [DOCKER_USER]" -ForegroundColor Yellow
    exit 1
}

Write-Host "Сборка образа API..." -ForegroundColor Cyan
docker build -t "${DockerUser}/api:latest" ./api

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при сборке образа API" -ForegroundColor Red
    exit 1
}

Write-Host "Загрузка образа на DockerHub..." -ForegroundColor Yellow
docker push "${DockerUser}/api:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при загрузке образа API" -ForegroundColor Red
    exit 1
}

Write-Host "✓ API успешно собран и загружен" -ForegroundColor Green
Write-Host ""
Write-Host "Для обновления сервиса выполните:" -ForegroundColor Yellow
Write-Host "  docker compose pull api" -ForegroundColor White
Write-Host "  docker compose up -d api" -ForegroundColor White

