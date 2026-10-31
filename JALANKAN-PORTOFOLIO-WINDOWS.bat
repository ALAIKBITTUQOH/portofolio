@echo off
setlocal
cd /d "%~dp0"
title Menjalankan Portofolio

echo ==========================================
echo   SETUP DAN MENJALANKAN PORTOFOLIO
echo ==========================================
echo.

where bun >nul 2>nul
if errorlevel 1 (
  echo ERROR: Bun belum terpasang atau belum masuk PATH.
  echo Install dari https://bun.sh lalu tutup dan buka CMD kembali.
  pause
  exit /b 1
)

if not exist ".env" (
  if exist ".env.example" (
    copy ".env.example" ".env" >nul
    echo File .env dibuat dari .env.example.
  ) else (
    echo ERROR: File .env dan .env.example tidak ditemukan.
    pause
    exit /b 1
  )
)

echo [1/4] Memasang dependency...
call bun install
if errorlevel 1 goto error

echo.
echo [2/4] Membuat Prisma Client...
call bunx prisma generate
if errorlevel 1 goto error

echo.
echo [3/4] Menyelaraskan skema database tanpa reset data...
call bunx prisma db push
if errorlevel 1 goto error

echo.
echo [4/4] Menjalankan website di http://localhost:3000
echo Tekan Ctrl+C untuk menghentikan server.
call bun dev
goto end

:error
echo.
echo Ada langkah yang gagal. Baca pesan error di atas sebelum melanjutkan.
pause
exit /b 1

:end
endlocal
