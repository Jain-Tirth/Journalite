#!/bin/bash

# Test script for deployed Journalite Analytics API
# Usage: ./test-deployment.sh <API_URL>

if [ -z "$1" ]; then
    echo "❌ Usage: ./test-deployment.sh <API_URL>"
    echo "Example: ./test-deployment.sh https://journalite-analytics-abc123-us-central1.a.run.app"
    exit 1
fi

API_URL="$1"
echo "🧪 Testing Journalite Analytics API at: $API_URL"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing health endpoint..."
response=$(curl -s -w "%{http_code}" "$API_URL/health")
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" = "200" ]; then
    echo "✅ Health check passed"
    echo "   Response: $body"
else
    echo "❌ Health check failed (HTTP $http_code)"
    echo "   Response: $body"
fi
echo ""

# Test 2: Welcome endpoint
echo "2️⃣ Testing welcome endpoint..."
response=$(curl -s -w "%{http_code}" "$API_URL/")
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" = "200" ]; then
    echo "✅ Welcome endpoint passed"
else
    echo "❌ Welcome endpoint failed (HTTP $http_code)"
    echo "   Response: $body"
fi
echo ""

# Test 3: Mood analysis
echo "3️⃣ Testing mood analysis..."
response=$(curl -s -w "%{http_code}" -X POST "$API_URL/analyze-mood" \
    -H "Content-Type: application/json" \
    -d '{"text": "I am feeling really happy today! This is amazing!"}')
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" = "200" ]; then
    echo "✅ Mood analysis passed"
    echo "   Response: $body"
else
    echo "❌ Mood analysis failed (HTTP $http_code)"
    echo "   Response: $body"
fi
echo ""

# Test 4: Generate insights
echo "4️⃣ Testing insights generation..."
response=$(curl -s -w "%{http_code}" -X POST "$API_URL/generate-insights" \
    -H "Content-Type: application/json" \
    -d '{"user_id": "test-user", "entries": [{"content": "Happy day", "mood": "happy"}, {"content": "Sad day", "mood": "sad"}]}')
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" = "200" ]; then
    echo "✅ Insights generation passed"
else
    echo "❌ Insights generation failed (HTTP $http_code)"
    echo "   Response: $body"
fi
echo ""

echo "🎉 API testing complete!"
echo ""
echo "📋 Summary:"
echo "   API URL: $API_URL"
echo "   Health: $([ "$http_code" = "200" ] && echo "✅ Working" || echo "❌ Failed")"
echo ""
echo "🔗 Next steps:"
echo "   1. Update your React app's .env file:"
echo "      REACT_APP_ANALYTICS_API_URL=$API_URL"
echo "   2. Restart your React development server"
echo "   3. Test the insights feature in your app"
