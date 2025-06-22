# Script to update internship listings from LinkedIn
param(
    [switch]$test
)

Write-Host "🔄 Starting internship update process..."

# Set the working directory to the project root
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Split-Path -Parent $scriptPath)

try {
    if ($test) {
        Write-Host "🧪 Running in test mode..."
        npm run "update-jobs:test"
    } else {
        Write-Host "🚀 Running in production mode..."
        npm run "update-jobs"
    }

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Update completed successfully!"
    } else {
        Write-Host "❌ Update failed with exit code $LASTEXITCODE"
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "❌ Error occurred: $_"
    exit 1
}
