@echo off
chcp 65001 >nul
echo ===================================================
echo   INICIANDO SISTEMA MONTANDON
echo ===================================================

:: Verifica se o Docker está rodando
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] O Docker nao esta rodando ou nao esta instalado.
    echo Por favor, instale o Docker Desktop e abra-o antes de continuar.
    pause
    exit /b
)

:: Cria o arquivo .env se não existir
if not exist .env (
    echo [AVISO] Arquivo .env nao encontrado. Criando a partir do exemplo...
    copy .env.example .env
    echo.
    echo [IMPORTANTE] Um arquivo '.env' foi criado. 
    echo Por favor, abra-o no Bloco de Notas e configure as chaves (Apify, Evolution API) antes de continuar.
    echo Apos configurar, salve o arquivo e execute este script novamente.
    echo.
    pause
    exit /b
)

echo [1/3] Parando containers antigos...
docker-compose -f docker-compose.windows.yml down

echo [2/3] Subindo servicos (Banco, Backend e Frontend)...
docker-compose -f docker-compose.windows.yml up -d --build

echo.
echo ===================================================
echo   SISTEMA ONLINE!
echo ===================================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000/docs
echo.
echo Para desligar, basta fechar o Docker Desktop ou rodar 'docker-compose down'.
echo.
pause
