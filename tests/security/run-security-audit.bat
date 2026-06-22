@echo off
setlocal EnableExtensions
cd /d "%~dp0..\.."

echo.
echo ========================================
echo  Elilon Advocacia - Security Audit
echo  %date% %time%
echo ========================================
echo.

echo [1/3] Backend npm audit...
cd backend
call npm audit
set BACKEND_AUDIT=%ERRORLEVEL%
cd ..

echo.
echo [2/3] Frontend npm audit...
call npm audit
set FRONTEND_AUDIT=%ERRORLEVEL%

echo.
echo [3/3] Static security checks...
node tests/security/run-security-audit.cjs
set STATIC_AUDIT=%ERRORLEVEL%

echo.
echo ========================================
echo  Audit complete
echo  Results: tests\security\audit-results.json
echo  Report:  docs\security\SECURITY-REPORT-V3.md
echo ========================================

exit /b 0
