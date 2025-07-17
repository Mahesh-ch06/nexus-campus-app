@echo off
setlocal enabledelayedexpansion

if "%1"=="create" (
    echo Creating checkpoint...
    git add .
    if "%~2"=="" (
        git commit -m "Checkpoint %date% %time%"
    ) else (
        git commit -m "%~2"
    )
    echo Checkpoint created successfully!
    git rev-parse --short HEAD
    goto end
)

if "%1"=="list" (
    echo Recent Checkpoints:
    git log --oneline -10
    goto end
)

if "%1"=="restore" (
    echo Available Checkpoints:
    git log --oneline -10
    echo.
    set /p commitHash=Enter checkpoint ID: 
    echo WARNING: This will discard uncommitted changes!
    set /p confirm=Continue? (y/N): 
    if /i "!confirm!"=="y" (
        git reset --hard !commitHash!
        echo Restored successfully!
    ) else (
        echo Cancelled
    )
    goto end
)

if "%1"=="push" (
    echo Pushing to GitHub...
    git push origin main
    if errorlevel 1 (
        echo Failed to push. Configure remote first:
        echo git remote add origin https://github.com/yourusername/CampusConnect-demo.git
    ) else (
        echo Pushed successfully!
    )
    goto end
)

echo Nexus Campus App - Checkpoint System
echo Usage:
echo   checkpoint.bat create "message"
echo   checkpoint.bat list
echo   checkpoint.bat restore
echo   checkpoint.bat push

:end
