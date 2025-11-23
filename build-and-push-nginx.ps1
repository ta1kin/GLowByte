# Скрипт для сборки и загрузки образа Nginx на DockerHub
# Использование: .\build-and-push-nginx.ps1 [DOCKER_USER]

param(
    [string]$DockerUser
)

if ([string]::IsNullOrEmpty($DockerUser)) {
    $DockerUser = $env:DOCKER_USER
}

if ([string]::IsNullOrEmpty($DockerUser)) {
    Write-Host "Ошибка: Укажите имя пользователя DockerHub" -ForegroundColor Red
    Write-Host "Использование: .\build-and-push-nginx.ps1 your_dockerhub_username" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "Сборка образа: nginx" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

docker build -t "$DockerUser/nginx:latest" -f nginx/Dockerfile .

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при сборке образа nginx" -ForegroundColor Red
    exit 1
}

Write-Host "`nЗагрузка образа: $DockerUser/nginx`:latest" -ForegroundColor Green
docker push "$DockerUser/nginx:latest"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Ошибка при загрузке образа nginx" -ForegroundColor Red
    exit 1
}

Write-Host "✓ nginx успешно собран и загружен" -ForegroundColor Green
Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "Образ nginx успешно загружен на DockerHub!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

