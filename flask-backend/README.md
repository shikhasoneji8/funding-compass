# FundingNEMO Flask Backend

This Flask backend connects to Gradient AI for pitch generation, advisor features, and feedback.

## Setup

1. **Install dependencies:**
   ```bash
   cd flask-backend
   pip install -r requirements.txt
   ```

2. **Set environment variable:**
   ```bash
   export MODEL_ACCESS_KEY="your-gradient-api-key"
   ```

3. **Run locally:**
   ```bash
   python app.py
   ```
   Server runs at `http://localhost:5000`

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/generate-pitch` | POST | Generate pitch assets (tagline, 30sec, 2min, deck_outline, cold_email, linkedin_intro) |
| `/ai-advisor` | POST | AI advisor (smart_guidance, competitor_analysis, investor_matching, financial_model, marketing_strategy) |
| `/pitch-feedback` | POST | Get AI feedback on user's pitch |

## Deployment Options

### Option 1: Railway (Recommended - Free tier available)
1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app)
3. Create new project → Deploy from GitHub
4. Add environment variable: `MODEL_ACCESS_KEY`
5. Railway auto-detects Python and deploys

### Option 2: Render
1. Push to GitHub
2. Go to [render.com](https://render.com)
3. Create new Web Service → Connect repo
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn app:app`
6. Add environment variable: `MODEL_ACCESS_KEY`

### Option 3: DigitalOcean App Platform
1. Push to GitHub
2. Go to DigitalOcean App Platform
3. Create App → Connect repo
4. Set run command: `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Add environment variable: `MODEL_ACCESS_KEY`

### Option 4: Heroku
1. Add `Procfile`:
   ```
   web: gunicorn app:app
   ```
2. Push to Heroku
3. Set config var: `heroku config:set MODEL_ACCESS_KEY=your-key`

## After Deployment

Once deployed, update the frontend environment variable:
```
VITE_FLASK_API_URL=https://your-deployed-url.com
```

Then rebuild the Lovable app.
