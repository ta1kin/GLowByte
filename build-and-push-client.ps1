# Скрипт для сборки и загрузки образа фронтенда на DockerHub
# Использование: .\build-and-push-client.ps1 [DOCKER_USER]

param(
    [string]$DockerUser
)

if ([string]::IsNullOrEmpty($DockerUser)) {
    $DockerUser = $env:DOCKER_USER
}

if ([string]::IsNullOrEmpty($DockerUser)) {
    Write-Host "Ошибка: Укажите имя пользователя DockerHub" -ForegroundColor Red
    Write-Host "Использование: .\build-and-push-client.ps1 your_dockerhub_username" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Сборка образа: client" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

docker build -t "$DockerUser/client:latest" -f client/Dockerfile client

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при сборке образа client" -ForegroundColor Red
    exit 1
}

Write-Host "`nЗагрузка образа: $DockerUser/client`:latest" -ForegroundColor Green
docker push "$DockerUser/client:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при загрузке образа client" -ForegroundColor Red
    exit 1
}

Write-Host "✓ client успешно собран и загружен" -ForegroundColor Green
Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "Образ client успешно загружен на DockerHub!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

