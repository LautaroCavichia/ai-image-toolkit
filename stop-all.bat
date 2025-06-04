@echo off
echo Deteniendo servicios...

echo Deteniendo RabbitMQ...
docker stop some-rabbit

echo Cerrando procesos Node.js...
taskkill /f /im node.exe 2>nul

echo Cerrando procesos Java...
taskkill /f /im java.exe 2>nul

echo Cerrando procesos Python...
taskkill /f /im python.exe 2>nul

echo Servicios detenidos correctamente!
pause
