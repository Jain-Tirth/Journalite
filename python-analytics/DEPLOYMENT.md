# 🚀 Journalite Analytics - Google Cloud Deployment Guide

This guide will help you deploy the Journalite Analytics API to Google Cloud Run with **FREE TIER** optimization.

## 💰 Cost Overview

### **FREE TIER BENEFITS**
- ✅ **$300 free credit** for new Google Cloud users (90 days)
- ✅ **2 million requests/month** free on Cloud Run
- ✅ **360,000 GB-seconds** free compute time
- ✅ **120 build-minutes/day** free on Cloud Build

### **Expected Costs for Your App**
- **Development/Testing**: **$0** (stays within free tier)
- **Light Production**: **$0-5/month**
- **Medium Usage**: **$5-20/month**

## 📋 Prerequisites

### **1. Install Google Cloud CLI**

#### **Windows (PowerShell as Administrator)**
```powershell
# Option 1: Download installer
# Visit: https://cloud.google.com/sdk/docs/install-sdk

# Option 2: Use Chocolatey
choco install gcloudsdk

# Option 3: Use Scoop
scoop install gcloud
```

#### **Alternative: Use Google Cloud Shell**
- Visit [shell.cloud.google.com](https://shell.cloud.google.com)
- Everything is pre-installed in the browser

### **2. Verify Installation**
```bash
gcloud --version
```

## 🚀 **QUICK DEPLOYMENT (3 Steps)**

### **Step 1: Setup Google Cloud**

#### **Windows PowerShell:**
```powershell
# Navigate to python-analytics folder
cd python-analytics

# Run setup script
.\setup-gcloud.ps1
```

#### **Linux/Mac/Cloud Shell:**
```bash
# Navigate to python-analytics folder
cd python-analytics

# Make script executable
chmod +x setup-gcloud.sh

# Run setup script
./setup-gcloud.sh
```

### **Step 2: Deploy to Cloud Run**

```bash
# Run deployment script
./deploy-cloud-run.sh
```

### **Step 3: Test Your API**

After deployment, you'll get a URL like:
```
https://journalite-analytics-[hash]-us-central1.a.run.app
```

Test it:
```bash
curl https://your-api-url.a.run.app/health
```

## 🔧 **Manual Deployment (If Scripts Don't Work)**

### **1. Authenticate & Setup**
```bash
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project journalite-a1327

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Set default region
gcloud config set run/region us-central1
```

### **2. Deploy**
```bash
# Navigate to python-analytics folder
cd python-analytics

# Deploy to Cloud Run
gcloud run deploy journalite-analytics \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 80
```

## ⚙️ **Free Tier Optimization**

### **Resource Configuration**
```yaml
# Optimized for FREE TIER
CPU: 1 vCPU
Memory: 512Mi (minimum for Python)
Min Instances: 0 (scale to zero when not used)
Max Instances: 10
Concurrency: 80 requests per instance
```

### **Cost Monitoring Setup**

1. **Set Billing Alerts**:
   ```bash
   # Open billing console
   gcloud alpha billing budgets create \
     --billing-account=[YOUR-BILLING-ACCOUNT] \
     --display-name="Journalite Budget" \
     --budget-amount=10USD
   ```

2. **Or use Web Console**:
   - Visit: [console.cloud.google.com/billing](https://console.cloud.google.com/billing)
   - Create budget alerts at $1, $5, $10

## 🔗 **Update Your React App**

After deployment, update your React app's API URL:

### **1. Update Environment Variables**
```bash
# In your React app root directory
echo "REACT_APP_ANALYTICS_API_URL=https://your-deployed-url.a.run.app" >> .env
```

### **2. Update API Calls**
The API will be available at:
```javascript
const API_BASE_URL = process.env.REACT_APP_ANALYTICS_API_URL || 'http://localhost:5000';
```

## 📊 **Available API Endpoints**

Your deployed API will have these endpoints:

```
GET  /                     - Welcome message
GET  /health              - Health check
POST /analyze-mood        - Analyze mood from text
POST /generate-insights   - Generate comprehensive insights
POST /emotion-distribution - Get emotion distribution
POST /sentiment-analysis  - Sentiment analysis over time
POST /word-cloud         - Generate word cloud data
POST /writing-patterns   - Analyze writing patterns
POST /mood-correlations  - Analyze mood correlations
POST /auto-detect-mood   - Auto-detect mood for entries
```

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **1. "gcloud not found"**
```bash
# Restart terminal after installation
# Or add to PATH manually
```

#### **2. "Project not found"**
```bash
# Verify project ID
gcloud projects list

# Set correct project
gcloud config set project journalite-a1327
```

#### **3. "Permission denied"**
```bash
# Re-authenticate
gcloud auth login

# Check permissions
gcloud projects get-iam-policy journalite-a1327
```

#### **4. "Build failed"**
```bash
# Check build logs
gcloud builds list --limit=5

# View specific build
gcloud builds log [BUILD-ID]
```

### **View Logs**
```bash
# Application logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=journalite-analytics" --limit=50

# Real-time logs
gcloud logs tail "resource.type=cloud_run_revision AND resource.labels.service_name=journalite-analytics"
```

## 🔒 **Security & Best Practices**

### **1. CORS Configuration**
Your API is configured to accept requests from:
- `http://localhost:3000` (development)
- Your production domain (update in app.py)

### **2. Environment Variables**
```bash
# Set environment variables in Cloud Run
gcloud run services update journalite-analytics \
  --set-env-vars="ENVIRONMENT=production" \
  --region=us-central1
```

### **3. Custom Domain (Optional)**
```bash
# Map custom domain
gcloud run domain-mappings create \
  --service=journalite-analytics \
  --domain=api.yourdomain.com \
  --region=us-central1
```

## 📈 **Monitoring & Scaling**

### **1. Monitor Usage**
- Visit: [console.cloud.google.com/run](https://console.cloud.google.com/run)
- Check metrics: requests, latency, errors
- Monitor costs in billing section

### **2. Auto-scaling**
Your service automatically scales:
- **Scale to zero**: No cost when not used
- **Scale up**: Based on incoming requests
- **Max instances**: 10 (prevents runaway costs)

## ✅ **Deployment Checklist**

- [ ] Google Cloud CLI installed
- [ ] Authenticated with Google Cloud
- [ ] Project set to `journalite-a1327`
- [ ] Required APIs enabled
- [ ] Deployment successful
- [ ] API health check passes
- [ ] React app updated with new API URL
- [ ] Billing alerts configured
- [ ] Usage monitoring set up

## 🎉 **Success!**

After successful deployment:

1. **Your API URL**: `https://journalite-analytics-[hash]-us-central1.a.run.app`
2. **Test endpoint**: `/health`
3. **Update React app**: Use new API URL
4. **Monitor costs**: Check Google Cloud Console
5. **Scale automatically**: Based on usage

Your Python analytics API is now running on Google Cloud with **free tier optimization**! 🚀
