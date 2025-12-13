# FundingNEMO API Backend

Node.js Express backend for Gradient AI integration.

## Local Development

```bash
cd api
npm install
MODEL_ACCESS_KEY=your_key npm start
```

## Deployment on DigitalOcean App Platform

1. **Deploy Backend:**
   - Create new App on DO App Platform
   - Set Root Directory: `api/`
   - Set environment variable: `MODEL_ACCESS_KEY`
   - Build command: `npm install`
   - Run command: `npm start`

2. **Deploy Frontend:**
   - Keep existing Vite deploy
   - Add env var: `VITE_API_BASE=https://your-backend-app.ondigitalocean.app`

## Endpoints

- `GET /health` - Health check
- `POST /generate` - Call Gradient AI with messages array
