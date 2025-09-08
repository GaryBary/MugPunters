@echo off
echo Opening Report History Demo...
echo.
echo This will open the ReportHistory component in your default browser.
echo No installations required - it's a standalone HTML file!
echo.

REM Get the current directory
set "CURRENT_DIR=%~dp0"

REM Open the HTML file in the default browser
start "" "%CURRENT_DIR%static-demo\report-history-demo.html"

echo.
echo Demo opened in your browser!
echo.
echo Features you can try:
echo - Filter reports by risk level and timeframe
echo - Click "Re-evaluate" to update performance data
echo - View performance tracking with accuracy scores
echo - See real-time updates and animations
echo.
pause
