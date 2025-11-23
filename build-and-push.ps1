# Скрипт для сборки и загрузки всех образов на DockerHub
# Использование: .\build-and-push.ps1 [DOCKER_USER]

param(
    [string]$DockerUser = $env:DOCKER_USER
)

if ([string]::IsNullOrEmpty($DockerUser)) {
    Write-Host "Ошибка: Укажите имя пользователя DockerHub" -ForegroundColor Red
    Write-Host "Использование: .\build-and-push.ps1 [DOCKER_USER]" -ForegroundColor Yellow
    Write-Host "Или установите переменную окружения: `$env:DOCKER_USER='your_username'" -ForegroundColor Yellow
    exit 1
}

Write-Host "Используется пользователь DockerHub: $DockerUser" -ForegroundColor Green

# Функция для сборки и загрузки образа
function Build-AndPush {
    param(
        [string]$Service,
        [string]$Context,
        [string]$Dockerfile = "Dockerfile"
    )
    
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Сборка образа: $Service" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    
    docker build -t "${DockerUser}/${Service}:latest" -f "${Context}/${Dockerfile}" $Context
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Ошибка при сборке образа $Service" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Загрузка образа: ${DockerUser}/${Service}:latest" -ForegroundColor Yellow
    docker push "${DockerUser}/${Service}:latest"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Ошибка при загрузке образа $Service" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ $Service успешно собран и загружен" -ForegroundColor Green
}

# Сборка и загрузка всех сервисов
Build-AndPush -Service "api" -Context "./api"
Build-AndPush -Service "bot" -Context "./bot"
Build-AndPush -Service "ml-service" -Context "./ml-service"
Build-AndPush -Service "client" -Context "./client"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Все образы успешно собраны и загружены!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Для обновления сервисов выполните:" -ForegroundColor Yellow
Write-Host "  docker compose pull" -ForegroundColor White
Write-Host "  docker compose up -d" -ForegroundColor White

