@echo off
chcp 65001 >nul
echo ===================================================
echo   ATUALIZANDO SISTEMA MONTANDON
echo ===================================================

echo [1/3] Baixando atualizacoes do Git...
git pull origin main

echo [2/3] Recriando containers com novas versoes...
docker-compose -f docker-compose.windows.yml up -d --build

echo.
echo ===================================================
echo   ATUALIZACAO CONCLUIDA!
echo ===================================================
echo.
pause
