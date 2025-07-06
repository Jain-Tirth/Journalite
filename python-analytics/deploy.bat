@echo off
echo 🚀 Deploying Journalite Analytics to Google Cloud Run...

REM Configuration
set PROJECT_ID=journalite-a1327
set SERVICE_NAME=journalite-analytics
set REGION=us-central1
set IMAGE_NAME=gcr.io/%PROJECT_ID%/%SERVICE_NAME%

echo Project: %PROJECT_ID%
echo Service: %SERVICE_NAME%
echo Region: %REGION%

REM Check if gcloud is installed
gcloud --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Google Cloud SDK is not installed. Please install it first:
    echo https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install it first:
    echo https://docs.docker.com/get-docker/
    pause
    exit /b 1
)

echo 📋 Setting Google Cloud project...
gcloud config set project %PROJECT_ID%

echo 🔧 Enabling required APIs...
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

echo 🏗️ Building Docker image...
docker build -t %IMAGE_NAME% .

echo 📤 Pushing image to Google Container Registry...
docker push %IMAGE_NAME%

echo 🚀 Deploying to Cloud Run...
gcloud run deploy %SERVICE_NAME% --image %IMAGE_NAME% --platform managed --region %REGION% --allow-unauthenticated --port 8080 --memory 1Gi --cpu 1 --max-instances 10 --set-env-vars "FLASK_ENV=production"

echo ✅ Deployment completed!
echo 🌐 Getting service URL...
for /f "tokens=*" %%i in ('gcloud run services describe %SERVICE_NAME% --platform managed --region %REGION% --format "value(status.url)"') do set SERVICE_URL=%%i

echo 🔗 Service URL: %SERVICE_URL%
echo 🔗 Health Check: %SERVICE_URL%/health
echo.
echo 📝 Next steps:
echo 1. Update your React app to use this URL: %SERVICE_URL%
echo 2. Test the API endpoints
echo 3. Configure CORS if needed

pause
