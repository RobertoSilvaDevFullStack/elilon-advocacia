@echo off
echo ==========================================
echo SPRINT 3.4.2 - HOMOLOGACAO OPERACIONAL
echo ==========================================
echo.

set TEST_DIR=%~dp0
cd /d "%TEST_DIR%"

echo [FASE 1] Gerando massa de testes...
node generate-test-data.cjs > fase1-output.log 2>&1
echo [OK] Fase 1 concluida - ver fase1-output.log
echo.

echo [FASE 2] Teste de fluxo completo...
node test-flow-complete.cjs > fase2-output.log 2>&1
echo [OK] Fase 2 concluida - ver fase2-output.log
echo.

echo [FASE 3] Teste de documentos...
node test-documents.cjs > fase3-output.log 2>&1
echo [OK] Fase 3 concluida - ver fase3-output.log
echo.

echo [FASE 9] Auditoria de banco de dados...
node test-database-audit.cjs > fase9-output.log 2>&1
echo [OK] Fase 9 concluida - ver fase9-output.log
echo.

echo ==========================================
echo TODAS AS FASES CONCLUIDAS
echo ==========================================
echo.
echo Relatorios gerados:
echo  - fase2-fluxo-completo-report.md
echo  - fase3-documentos-report.md
echo  - fase9-auditoria-banco-report.md
echo.
pause
