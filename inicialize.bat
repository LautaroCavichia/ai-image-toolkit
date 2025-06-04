@echo off
REM Cambia a la carpeta raíz del proyecto (ajustá la ruta si es necesario)
cd /d "C:\Users\Bruno\Desktop\ai-image-toolkit"

echo Iniciando RabbitMQ...
docker start some-rabbit

echo Iniciando Backend...
start cmd /k "cd backend && call mvnw.cmd spring-boot:run"

echo Iniciando Microservicio...
start cmd /k "cd microservices\bg-removal-service && call .venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8001"

echo Esperando 15 segundos para que el backend arranque...
timeout /t 15 /nobreak

echo Iniciando Frontend...
start cmd /k "cd frontend && yarn start"

echo Todos los servicios iniciados!
pause
