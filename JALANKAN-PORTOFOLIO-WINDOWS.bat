
@echo off
setlocal

cd /d "%~dp0"
title Menjalankan Portofolio

echo ==========================================
echo       SETUP DAN MENJALANKAN PORTOFOLIO
echo ==========================================
echo.

REM Memeriksa Bun
where bun >nul 2>nul
if errorlevel 1 (
    echo ERROR: Bun belum terpasang atau belum masuk PATH.
    echo Install Bun dari https://bun.sh
    echo Kemudian buka kembali terminal.
    pause
    exit /b 1
)

REM Memeriksa file environment
if not exist ".env" (
    echo ERROR: File .env tidak ditemukan.
    echo Buat file .env dan isi koneksi Supabase terlebih dahulu.
    pause
    exit /b 1
)

REM Memeriksa package.json
if not exist "package.json" (
    echo ERROR: package.json tidak ditemukan.
    echo Pastikan file BAT berada di folder utama proyek.
    pause
    exit /b 1
)

echo [1/3] Memasang dependency...
call bun install
if errorlevel 1 goto error

echo.
echo [2/3] Membuat Prisma Client...
call bunx prisma@6.19.2 generate
if errorlevel 1 goto error

echo.
echo [3/3] Menjalankan website...
echo.
echo Website: http://localhost:3000
echo Tekan Ctrl+C untuk menghentikan server.
echo.

call bun run dev
if errorlevel 1 goto error

goto end

:error
echo.
echo ==========================================
echo TERJADI KESALAHAN SAAT MENJALANKAN PORTOFOLIO
echo Periksa pesan error di atas.
echo ==========================================
pause
exit /b 1

:end
echo.
echo Server telah berhenti.
pause
endlocal
