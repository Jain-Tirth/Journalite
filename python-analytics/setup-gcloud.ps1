# Google Cloud Setup Script for Journalite Analytics (PowerShell)
# Run this script after installing Google Cloud CLI

Write-Host "🚀 Setting up Google Cloud for Journalite Analytics..." -ForegroundColor Green

# Configuration
$PROJECT_ID = "journalite-a1327"
$SERVICE_NAME = "journalite-analytics"
$REGION = "us-central1"

Write-Host "📋 Project ID: $PROJECT_ID" -ForegroundColor Cyan
Write-Host "🌍 Region: $REGION" -ForegroundColor Cyan
Write-Host "🔧 Service: $SERVICE_NAME" -ForegroundColor Cyan

# Step 1: Authenticate with Google Cloud
Write-Host "🔐 Step 1: Authenticating with Google Cloud..." -ForegroundColor Yellow
gcloud auth login

# Step 2: Set the project
Write-Host "📁 Step 2: Setting project..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID

# Step 3: Enable required APIs
Write-Host "🔌 Step 3: Enabling required APIs..." -ForegroundColor Yellow
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Step 4: Set default region
Write-Host "🌍 Step 4: Setting default region..." -ForegroundColor Yellow
gcloud config set run/region $REGION

# Step 5: Verify setup
Write-Host "✅ Step 5: Verifying setup..." -ForegroundColor Yellow
gcloud config list
gcloud projects describe $PROJECT_ID

Write-Host "🎉 Google Cloud setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: .\deploy-cloud-run.sh" -ForegroundColor White
Write-Host "2. Your API will be available at: https://$SERVICE_NAME-[hash]-$REGION.a.run.app" -ForegroundColor White
Write-Host ""
Write-Host "💰 Cost monitoring:" -ForegroundColor Cyan
Write-Host "- Visit: https://console.cloud.google.com/billing" -ForegroundColor White
Write-Host "- Set up billing alerts" -ForegroundColor White
Write-Host "- Monitor usage in Cloud Console" -ForegroundColor White
