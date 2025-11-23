# Скрипт для сборки и загрузки образа ML Service на DockerHub
# Использование: .\build-and-push-ml-service.ps1 [DOCKER_USER]

param(
    [string]$DockerUser = $env:DOCKER_USER
)

if ([string]::IsNullOrEmpty($DockerUser)) {
    Write-Host "Ошибка: Укажите имя пользователя DockerHub" -ForegroundColor Red
    Write-Host "Использование: .\build-and-push-ml-service.ps1 [DOCKER_USER]" -ForegroundColor Yellow
    exit 1
}

Write-Host "Сборка образа ML Service..." -ForegroundColor Cyan
docker build -t "${DockerUser}/ml-service:latest" ./ml-service

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при сборке образа ML Service" -ForegroundColor Red
    exit 1
}

Write-Host "Загрузка образа на DockerHub..." -ForegroundColor Yellow
docker push "${DockerUser}/ml-service:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при загрузке образа ML Service" -ForegroundColor Red
    exit 1
}

Write-Host "✓ ML Service успешно собран и загружен" -ForegroundColor Green
Write-Host ""
Write-Host "Для обновления сервиса выполните:" -ForegroundColor Yellow
Write-Host "  docker compose pull ml-service" -ForegroundColor White
Write-Host "  docker compose up -d ml-service" -ForegroundColor White

