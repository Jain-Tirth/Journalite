#!/bin/bash

# Google Cloud Setup Script for Journalite Analytics
# Run this script after installing Google Cloud CLI

echo "🚀 Setting up Google Cloud for Journalite Analytics..."

# Configuration
PROJECT_ID="journalite-a1327"
SERVICE_NAME="journalite-analytics"
REGION="us-central1"

echo "📋 Project ID: $PROJECT_ID"
echo "🌍 Region: $REGION"
echo "🔧 Service: $SERVICE_NAME"

# Step 1: Authenticate with Google Cloud
echo "🔐 Step 1: Authenticating with Google Cloud..."
gcloud auth login

# Step 2: Set the project
echo "📁 Step 2: Setting project..."
gcloud config set project $PROJECT_ID

# Step 3: Enable required APIs
echo "🔌 Step 3: Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Step 4: Set default region
echo "🌍 Step 4: Setting default region..."
gcloud config set run/region $REGION

# Step 5: Verify setup
echo "✅ Step 5: Verifying setup..."
gcloud config list
gcloud projects describe $PROJECT_ID

echo "🎉 Google Cloud setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: ./deploy-cloud-run.sh"
echo "2. Your API will be available at: https://$SERVICE_NAME-[hash]-$REGION.a.run.app"
echo ""
echo "💰 Cost monitoring:"
echo "- Visit: https://console.cloud.google.com/billing"
echo "- Set up billing alerts"
echo "- Monitor usage in Cloud Console"
