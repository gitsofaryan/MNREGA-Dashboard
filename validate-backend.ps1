# Backend Pre-Deployment Validation Script
# Run this before deploying to VPS to catch any issues

Write-Host "🔍 MGNREGA Backend Validation Started..." -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# 1. Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($nodeVersion -match "v(\d+)\.") {
    $majorVersion = [int]$matches[1]
    if ($majorVersion -ge 18) {
        Write-Host "✅ Node.js $nodeVersion (required: v18+)" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js $nodeVersion is too old (required: v18+)" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    $errors++
}
Write-Host ""

# 2. Check if backend directory exists
Write-Host "Checking backend directory..." -ForegroundColor Yellow
if (Test-Path "backend") {
    Write-Host "✅ Backend directory exists" -ForegroundColor Green
} else {
    Write-Host "❌ Backend directory not found" -ForegroundColor Red
    $errors++
}
Write-Host ""

# 3. Check required backend files
Write-Host "Checking required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "backend\package.json",
    "backend\.env.example",
    "backend\server.js",
    "backend\db\database.js",
    "backend\routes\api.js",
    "backend\services\syncService.js",
    "backend\utils\logger.js",
    "backend\scripts\init-db.js",
    "backend\scripts\sync-data.js",
    "backend\deploy.sh"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        $errors++
    }
}
Write-Host ""

# 4. Check if .env exists
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    
    # Check if it's properly configured
    $envContent = Get-Content "backend\.env" -Raw
    if ($envContent -match "DB_PASSWORD=your_secure_password_here" -or $envContent -match "DB_PASSWORD=$") {
        Write-Host "⚠️  WARNING: DB_PASSWORD not set in .env" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "⚠️  WARNING: .env not found (will use .env.example)" -ForegroundColor Yellow
    $warnings++
}
Write-Host ""

# 5. Check if node_modules exists
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "backend\node_modules") {
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  WARNING: Dependencies not installed (run 'npm install' in backend folder)" -ForegroundColor Yellow
    $warnings++
}
Write-Host ""

# 6. Check documentation files
Write-Host "Checking documentation..." -ForegroundColor Yellow
$docFiles = @(
    "README.md",
    "ARCHITECTURE.md",
    "PRODUCTION_READINESS.md",
    "QUICKSTART.md",
    "FRONTEND_INTEGRATION.md",
    "backend\README.md",
    "backend\DEPLOYMENT.md"
)

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        $errors++
    }
}
Write-Host ""

# 7. Check PostgreSQL (if installed locally)
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version 2>$null
    if ($pgVersion) {
        Write-Host "✅ PostgreSQL installed: $pgVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: PostgreSQL not found (required for local testing)" -ForegroundColor Yellow
        $warnings++
    }
} catch {
    Write-Host "⚠️  WARNING: PostgreSQL not found (required for local testing)" -ForegroundColor Yellow
    $warnings++
}
Write-Host ""

# 8. Syntax check for JavaScript files
Write-Host "Checking JavaScript syntax..." -ForegroundColor Yellow
$jsFiles = @(
    "backend\server.js",
    "backend\db\database.js",
    "backend\routes\api.js",
    "backend\services\syncService.js",
    "backend\utils\logger.js",
    "backend\scripts\init-db.js",
    "backend\scripts\sync-data.js"
)

foreach ($file in $jsFiles) {
    if (Test-Path $file) {
        $syntaxCheck = node --check $file 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $file syntax OK" -ForegroundColor Green
        } else {
            Write-Host "❌ $file has syntax errors: $syntaxCheck" -ForegroundColor Red
            $errors++
        }
    }
}
Write-Host ""

# 9. Check package.json scripts
Write-Host "Checking package.json scripts..." -ForegroundColor Yellow
if (Test-Path "backend\package.json") {
    $packageJson = Get-Content "backend\package.json" | ConvertFrom-Json
    $requiredScripts = @("start", "dev", "init-db", "sync-data")
    
    foreach ($script in $requiredScripts) {
        if ($packageJson.scripts.$script) {
            Write-Host "✅ Script '$script' defined" -ForegroundColor Green
        } else {
            Write-Host "❌ Script '$script' missing" -ForegroundColor Red
            $errors++
        }
    }
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
    $errors++
}
Write-Host ""

# 10. Security check
Write-Host "Checking security..." -ForegroundColor Yellow

# Check if .gitignore exists and includes sensitive files
if (Test-Path "backend\.gitignore") {
    $gitignore = Get-Content "backend\.gitignore" -Raw
    if ($gitignore -match "\.env" -and $gitignore -match "node_modules" -and $gitignore -match "logs") {
        Write-Host "✅ .gitignore properly configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: .gitignore may be missing important entries" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "⚠️  WARNING: .gitignore not found" -ForegroundColor Yellow
    $warnings++
}

# Check if .env is in .gitignore (shouldn't be committed)
if (Test-Path ".git") {
    $gitStatus = git ls-files "backend\.env" 2>$null
    if ($gitStatus) {
        Write-Host "❌ CRITICAL: .env is tracked by git (should be in .gitignore)" -ForegroundColor Red
        $errors++
    } else {
        Write-Host "✅ .env not tracked by git" -ForegroundColor Green
    }
}
Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "VALIDATION SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your backend is ready for deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. cd backend" -ForegroundColor White
    Write-Host "2. npm install (if not done)" -ForegroundColor White
    Write-Host "3. cp .env.example .env" -ForegroundColor White
    Write-Host "4. Edit .env with your database credentials" -ForegroundColor White
    Write-Host "5. npm run init-db (initialize database)" -ForegroundColor White
    Write-Host "6. npm run sync-data (sync initial data)" -ForegroundColor White
    Write-Host "7. npm start (start server)" -ForegroundColor White
} elseif ($errors -eq 0) {
    Write-Host "⚠️  PASSED WITH WARNINGS ($warnings warnings)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Your backend is mostly ready, but please review the warnings above." -ForegroundColor Yellow
} else {
    Write-Host "❌ VALIDATION FAILED ($errors errors, $warnings warnings)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the errors above before deploying." -ForegroundColor Red
}

Write-Host ""
Write-Host "For detailed deployment instructions, see:" -ForegroundColor Cyan
Write-Host "  - backend/DEPLOYMENT.md (VPS deployment)" -ForegroundColor White
Write-Host "  - QUICKSTART.md (local + production setup)" -ForegroundColor White
Write-Host "  - FRONTEND_INTEGRATION.md (connect frontend to backend)" -ForegroundColor White
Write-Host ""

exit $errors
