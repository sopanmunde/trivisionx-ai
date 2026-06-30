# Check for python virtual environment
if (-not (Test-Path "backend\.venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv backend\.venv
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    & backend\.venv\Scripts\pip install -r backend\requirements.txt
}

# Check for node_modules in frontend
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    cd frontend
    if (Get-Command bun -ErrorAction SilentlyContinue) {
        bun install
    } else {
        npm install
    }
    cd ..
}

Write-Host "Starting TriVisionX Backend..." -ForegroundColor Green
# Start backend in a separate terminal window so its outputs don't mix and block Ctrl+C
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .venv\Scripts\activate; python index.py"

Write-Host "Starting TriVisionX Frontend..." -ForegroundColor Green
cd frontend
if (Get-Command bun -ErrorAction SilentlyContinue) {
    bun dev
} else {
    npm run dev
}
