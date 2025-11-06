# 🚀 Deployment Guide - Auth Microservice

This guide covers deploying the auth microservice to production environments.

---

## 🎯 Deployment Options

1. **Firebase Hosting + Cloud Functions** (Recommended for Firebase ecosystem)
2. **Docker + Cloud Run** (Google Cloud Platform)
3. **Heroku** (Easy deployment)
4. **AWS EC2 / Azure VM** (Traditional server)
5. **Vercel / Netlify** (Serverless)

---

## 🔥 Option 1: Firebase Cloud Functions (Recommended)

### Why?
- Native Firebase integration
- Auto-scaling
- Pay-per-use pricing
- No server management

### Steps

1. **Install Firebase CLI**
```powershell
npm install -g firebase-tools
firebase login
```

2. **Initialize Functions**
```powershell
cd D:\AKASA\user-registration-login-auth
firebase init functions
```

3. **Modify for Cloud Functions**
Create `functions/index.js`:
```javascript
const functions = require('firebase-functions');
const app = require('./src/server');

exports.auth = functions.https.onRequest(app);
```

4. **Deploy**
```powershell
firebase deploy --only functions
```

5. **Access URL**
```
https://us-central1-<project-id>.cloudfunctions.net/auth
```

---

## 🐳 Option 2: Docker + Google Cloud Run

### Why?
- Containerized deployment
- Auto-scaling
- Cost-effective
- Full control

### Step 1: Create Dockerfile

Create `Dockerfile` in project root:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "src/server.js"]
```

### Step 2: Create .dockerignore
```
node_modules
npm-debug.log
.env
.git
.gitignore
*.md
test-api.js
postman_collection.json
serviceAccountKey.json
```

### Step 3: Build and Test Locally
```powershell
# Build image
docker build -t auth-service .

# Run locally
docker run -p 3001:3001 `
  -e FIREBASE_SERVICE_ACCOUNT_PATH=/app/serviceAccountKey.json `
  -v ${PWD}/serviceAccountKey.json:/app/serviceAccountKey.json `
  auth-service
```

### Step 4: Deploy to Cloud Run
```powershell
# Set project
gcloud config set project <your-project-id>

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/<project-id>/auth-service

# Deploy to Cloud Run
gcloud run deploy auth-service `
  --image gcr.io/<project-id>/auth-service `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars="NODE_ENV=production,API_PREFIX=/api/v1"
```

---

## 🌐 Option 3: Heroku

### Why?
- Easy deployment
- Free tier available
- Git-based deployment

### Steps

1. **Install Heroku CLI**
```powershell
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

2. **Create Heroku App**
```powershell
heroku login
heroku create akasaeats-auth
```

3. **Set Environment Variables**
```powershell
heroku config:set NODE_ENV=production
heroku config:set API_PREFIX=/api/v1
heroku config:set ALLOWED_ORIGINS=https://yourfrontend.com

# For service account, use base64 encoding
$base64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("serviceAccountKey.json"))
heroku config:set FIREBASE_SERVICE_ACCOUNT_BASE64=$base64
```

4. **Modify server.js to read base64**
Add to `src/config/firebase.js`:
```javascript
// For Heroku deployment
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  const serviceAccountJson = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
    'base64'
  ).toString('utf-8');
  const serviceAccount = JSON.parse(serviceAccountJson);
  
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
```

5. **Create Procfile**
```
web: node src/server.js
```

6. **Deploy**
```powershell
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a akasaeats-auth
git push heroku main
```

---

## ☁️ Option 4: AWS EC2

### Steps

1. **Launch EC2 Instance**
   - Ubuntu 22.04 LTS
   - t2.micro (free tier)
   - Open port 3001 in security group

2. **SSH into Instance**
```bash
ssh -i your-key.pem ubuntu@<ec2-public-ip>
```

3. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Install PM2**
```bash
sudo npm install -g pm2
```

5. **Clone and Setup**
```bash
git clone <your-repo>
cd user-registration-login-auth
npm install --production
```

6. **Upload Service Account**
```bash
# From local machine
scp -i your-key.pem serviceAccountKey.json ubuntu@<ec2-public-ip>:~/user-registration-login-auth/
```

7. **Create .env**
```bash
nano .env
# Add your environment variables
```

8. **Start with PM2**
```bash
pm2 start src/server.js --name auth-service
pm2 save
pm2 startup
```

9. **Set up Nginx (Optional)**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/auth-service
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/auth-service /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Production Environment Variables

Create `.env.production`:
```env
NODE_ENV=production
PORT=3001
API_PREFIX=/api/v1

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json

# CORS - Add your production frontend URL
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security
TRUST_PROXY=true
```

---

## 🛡️ Production Security Checklist

- [ ] Enable HTTPS (use Let's Encrypt or cloud provider SSL)
- [ ] Set strict CORS origins (no wildcards)
- [ ] Use environment variables for all secrets
- [ ] Enable Firebase App Check
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerts
- [ ] Enable logging (Winston, Sentry)
- [ ] Regular security updates
- [ ] Backup Firestore data
- [ ] Set up CI/CD pipeline

---

## 📊 Monitoring & Logging

### Firebase Console
- Monitor function executions
- Check error rates
- View logs in Cloud Logging

### Add Winston Logger
```powershell
npm install winston
```

Create `src/config/logger.js`:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

---

## 🚦 Health Checks & Uptime

### Set up Monitoring
Use services like:
- UptimeRobot (free)
- Pingdom
- Google Cloud Monitoring
- AWS CloudWatch

### Health Check Endpoint
Already implemented at `/health`

Configure monitoring to check:
```
GET https://your-domain.com/health
Expected: 200 OK
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to Cloud Run
      uses: google-github-actions/deploy-cloudrun@v0
      with:
        service: auth-service
        image: gcr.io/${{ secrets.GCP_PROJECT_ID }}/auth-service
        region: us-central1
        credentials: ${{ secrets.GCP_SA_KEY }}
```

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Cloud Functions: Auto-scales
- Cloud Run: Configure max instances
- EC2: Use Auto Scaling Group + Load Balancer

### Database Optimization
- Use Firestore indexes for queries
- Implement caching (Redis)
- Use connection pooling

### Rate Limiting
Install express-rate-limit:
```powershell
npm install express-rate-limit
```

Add to `src/server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 💰 Cost Optimization

### Firebase Functions
- Use `runWith` to configure memory
- Set min/max instances
- Use secrets manager for service account

### Cloud Run
- Set appropriate CPU/memory limits
- Configure autoscaling parameters
- Use Cloud CDN for static content

---

## 🐛 Troubleshooting Production Issues

### Check Logs
```powershell
# Cloud Functions
firebase functions:log

# Cloud Run
gcloud logging read "resource.type=cloud_run_revision"

# Heroku
heroku logs --tail -a akasaeats-auth
```

### Common Issues

**503 Service Unavailable**
- Check if service is running
- Verify environment variables
- Check Firebase quota

**401 Unauthorized**
- Verify service account permissions
- Check token expiration
- Validate CORS settings

**500 Internal Server Error**
- Check application logs
- Verify Firestore rules
- Check environment variables

---

## 📝 Deployment Checklist

- [ ] Service account key secured
- [ ] Environment variables configured
- [ ] CORS origins set correctly
- [ ] HTTPS enabled
- [ ] Health checks configured
- [ ] Monitoring set up
- [ ] Logging configured
- [ ] Rate limiting enabled
- [ ] Backup strategy in place
- [ ] CI/CD pipeline configured
- [ ] Documentation updated
- [ ] Team notified

---

## 🎉 Post-Deployment

1. **Verify Health**
```powershell
Invoke-RestMethod -Uri "https://your-domain.com/health"
```

2. **Test API**
Import Postman collection and test all endpoints

3. **Monitor Metrics**
- Check response times
- Monitor error rates
- Verify scaling

4. **Update Frontend**
Change API base URL to production endpoint

---

**Recommended:** Start with Cloud Run for the best balance of simplicity and scalability.

**Documentation Date:** November 6, 2025
