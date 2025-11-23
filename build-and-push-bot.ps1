# Скрипт для сборки и загрузки образа Bot на DockerHub
# Использование: .\build-and-push-bot.ps1 [DOCKER_USER]

param(
    [string]$DockerUser = $env:DOCKER_USER
)

if ([string]::IsNullOrEmpty($DockerUser)) {
    Write-Host "Ошибка: Укажите имя пользователя DockerHub" -ForegroundColor Red
    Write-Host "Использование: .\build-and-push-bot.ps1 [DOCKER_USER]" -ForegroundColor Yellow
    exit 1
}

Write-Host "Сборка образа Bot..." -ForegroundColor Cyan
docker build -t "${DockerUser}/bot:latest" ./bot

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при сборке образа Bot" -ForegroundColor Red
    exit 1
}

Write-Host "Загрузка образа на DockerHub..." -ForegroundColor Yellow
docker push "${DockerUser}/bot:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при загрузке образа Bot" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Bot успешно собран и загружен" -ForegroundColor Green
Write-Host ""
Write-Host "Для обновления сервиса выполните:" -ForegroundColor Yellow
Write-Host "  docker compose pull bot" -ForegroundColor White
Write-Host "  docker compose up -d bot" -ForegroundColor White

