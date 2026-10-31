@echo off
setlocal
title Instalasi LibreOffice untuk Pratinjau Microsoft Office
echo ================================================
echo  INSTALASI LIBREOFFICE
 echo ================================================
echo Aplikasi ini diperlukan agar file Word, Excel,
echo dan PowerPoint dapat ditampilkan dengan tata letak
 echo dokumen melalui browser.
echo.
where winget >nul 2>nul
if errorlevel 1 (
  echo ERROR: winget tidak ditemukan.
  echo Silakan instal LibreOffice secara manual dari:
  echo https://www.libreoffice.org/download/download-libreoffice/
  echo Setelah instalasi selesai, jalankan kembali portofolio.
  pause
  exit /b 1
)
echo Memulai instalasi LibreOffice melalui Windows Package Manager...
winget install --id TheDocumentFoundation.LibreOffice -e --accept-source-agreements --accept-package-agreements
if errorlevel 1 (
  echo Instalasi otomatis gagal. Silakan instal secara manual dari:
  echo https://www.libreoffice.org/download/download-libreoffice/
  pause
  exit /b 1
)
echo.
echo LibreOffice berhasil dipasang. Tutup dan buka kembali CMD/portofolio.
pause
endlocal
