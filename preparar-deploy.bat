@echo off
chcp 65001 >nul
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║          PREPARAÇÃO PARA DEPLOY - PULSE BLAST                    ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

REM Verifica se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERRO: Node.js não encontrado!
    echo    Instale em: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado: 
node --version
echo.

echo ════════════════════════════════════════════════════════════════════
echo ETAPA 1: Verificando configurações
echo ════════════════════════════════════════════════════════════════════
echo.

REM Verifica se o .env do backend existe
if not exist "backend\.env" (
    echo ❌ ERRO: Arquivo backend\.env não encontrado!
    pause
    exit /b 1
)

echo ⚠️  IMPORTANTE: Antes de continuar, certifique-se de que:
echo.
echo    1. Editou backend\.env:
echo       - Mudou JWT_SECRET para uma string aleatória
echo       - Mudou FRONTEND_URL para seu domínio
echo.
echo    2. Editou .env (raiz):
echo       - Mudou VITE_API_URL para apontar para seu backend
echo.
set /p continuar="   Você fez essas alterações? (S/N): "
if /i not "%continuar%"=="S" (
    echo.
    echo ❌ Por favor, edite os arquivos .env primeiro!
    echo    Consulte o arquivo DEPLOY-HOSTGATOR.txt para instruções
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════════
echo ETAPA 2: Instalando dependências do frontend
echo ════════════════════════════════════════════════════════════════════
echo.

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERRO ao instalar dependências do frontend!
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════════
echo ETAPA 3: Instalando dependências do backend
echo ════════════════════════════════════════════════════════════════════
echo.

cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERRO ao instalar dependências do backend!
    pause
    exit /b 1
)
cd ..

echo.
echo ════════════════════════════════════════════════════════════════════
echo ETAPA 4: Gerando build do frontend
echo ════════════════════════════════════════════════════════════════════
echo.

call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERRO ao fazer build do frontend!
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════════
echo ETAPA 5: Preparando arquivos para upload
echo ════════════════════════════════════════════════════════════════════
echo.

REM Cria pasta para deploy
if exist "DEPLOY" rmdir /s /q "DEPLOY"
mkdir "DEPLOY"
mkdir "DEPLOY\frontend"
mkdir "DEPLOY\backend"

REM Copia build do frontend
echo Copiando frontend...
xcopy /E /I /Y "dist\*" "DEPLOY\frontend\" >nul

REM Copia .htaccess para o frontend
if exist "frontend.htaccess" (
    copy /Y "frontend.htaccess" "DEPLOY\frontend\.htaccess" >nul
    echo ✅ .htaccess do frontend copiado
)

REM Copia backend
echo Copiando backend...
xcopy /E /I /Y "backend\*" "DEPLOY\backend\" >nul

REM Copia .htaccess para o backend
if exist "backend\backend.htaccess" (
    copy /Y "backend\backend.htaccess" "DEPLOY\backend\.htaccess" >nul
    echo ✅ .htaccess do backend copiado
)

REM Remove node_modules do backend (será instalado no servidor)
if exist "DEPLOY\backend\node_modules" (
    rmdir /s /q "DEPLOY\backend\node_modules"
)

echo.
echo ════════════════════════════════════════════════════════════════════
echo ✅ DEPLOY PREPARADO COM SUCESSO!
echo ════════════════════════════════════════════════════════════════════
echo.
echo 📁 Pasta DEPLOY criada com:
echo.
echo    DEPLOY/
echo    ├── frontend/          ← Enviar para public_html/
echo    │   ├── index.html
echo    │   ├── assets/
echo    │   └── .htaccess
echo    └── backend/           ← Enviar para public_html/api/
echo        ├── database/
echo        ├── routes/
echo        ├── .env
echo        ├── .htaccess
echo        └── package.json
echo.
echo ════════════════════════════════════════════════════════════════════
echo PRÓXIMOS PASSOS:
echo ════════════════════════════════════════════════════════════════════
echo.
echo 1. No phpMyAdmin da Hostgator:
echo    - Execute o SQL de: backend\database\schema.sql
echo.
echo 2. Upload dos arquivos:
echo    - DEPLOY\frontend\*  →  public_html/
echo    - DEPLOY\backend\*   →  public_html/api/
echo.
echo 3. No cPanel, configure Node.js App:
echo    - Application root: /home/usuario/public_html/api
echo    - Startup file: server.js
echo    - Execute "Run NPM Install"
echo    - Inicie a aplicação
echo.
echo 4. Teste:
echo    - https://seudominio.com.br/api/health
echo    - https://seudominio.com.br
echo.
echo 📚 Consulte DEPLOY-HOSTGATOR.txt para instruções detalhadas
echo.
pause
