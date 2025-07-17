@echo off
echo 🚀 CampusConnect-demo GitHub Setup
echo ===================================
echo.

set /p username=Enter your GitHub username: 

if "%username%"=="" (
    echo ❌ Username is required!
    pause
    exit /b 1
)

echo.
echo 📡 Setting up GitHub remote...
git remote add origin https://github.com/%username%/CampusConnect-demo.git

if errorlevel 1 (
    echo ⚠️  Remote might already exist. Updating...
    git remote set-url origin https://github.com/%username%/CampusConnect-demo.git
)

echo.
echo 🚀 Pushing to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ Failed to push to GitHub
    echo.
    echo 📋 Make sure you've created the repository on GitHub first:
    echo    1. Go to https://github.com/new
    echo    2. Repository name: CampusConnect-demo
    echo    3. Don't initialize with README, .gitignore, or license
    echo    4. Click 'Create repository'
    echo.
    echo Then run this script again.
    pause
    exit /b 1
)

echo.
echo ✅ Success! Your repository is now on GitHub
echo 🌐 View at: https://github.com/%username%/CampusConnect-demo
echo.
echo 🎯 Next steps:
echo   - Use 'checkpoint.bat create "message"' to save your work
echo   - Use 'checkpoint.bat push' to upload to GitHub
echo   - Use 'checkpoint.bat restore' to go back if needed
echo.
pause
