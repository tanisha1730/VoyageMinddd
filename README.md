# AI Travel Planner

A complete full-stack AI-powered travel planning application with intelligent itinerary generation, drag-and-drop planning interface, and memory creation features.

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS + React Router + React Beautiful DnD + Google Maps
- **Backend**: Node.js + Express + Mongoose (MongoDB)
- **ML Service**: Python + FastAPI + spaCy + scikit-learn (Dockerized)
- **Caching**: Redis
- **Export**: Puppeteer (PDF generation)
- **Infrastructure**: Docker + Docker Compose

## Project Structure

```
ai-travel-planner/
├── README.md
├── docker-compose.yml
├── .github/workflows/ci.yml
├── backend/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── tests/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── tests/
├── ml/
│   ├── src/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── models/
│   └── tests/
├── infra/
│   └── nginx.conf
├── scripts/
│   └── seedPlaces.js
└── docs/
    └── openapi.yaml
```

## Environment Variables

Copy the `.env.example` files in each service directory and configure:

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/ai-travel-planner
REDIS_URL=redis://localhost:6379
GOOGLE_MAPS_API_KEY=your_google_maps_key
OPENWEATHER_KEY=your_openweather_key
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_email_password
ML_SERVICE_SECRET=your_ml_service_secret
ML_SERVICE_URL=http://localhost:8001
```

### Frontend (.env)
```
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_key
```

### ML Service (.env)
```
ML_SERVICE_SECRET=your_ml_service_secret
```

## Quick Start (Docker Compose)

1. Clone the repository
2. Copy and configure environment files
3. Run the full stack:

```bash
docker-compose up --build
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- ML Service: http://localhost:8001
- MongoDB: localhost:27017
- Redis: localhost:6379

## Individual Service Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

### ML Service

```bash
cd ml
pip install -r requirements.txt
cp .env.example .env
# Configure your .env file
python -m spacy download en_core_web_sm
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

## Database Setup

1. Start MongoDB
2. Seed places data:

```bash
cd scripts
node seedPlaces.js
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### ML Service Tests
```bash
cd ml
pytest tests/
```

### E2E Tests
```bash
cd frontend
npm run test:e2e
```

## API Documentation

OpenAPI documentation is available at `/docs/openapi.yaml` and can be viewed at `http://localhost:3001/api-docs` when the backend is running.

## Acceptance Checklist

- [x] Mongoose schemas match document's JSON structures exactly
- [x] Backend endpoints exist with same input/output fields
- [x] ML microservice exposes /nlp/parse, /recommend, /optimize, /weather-adjust, /postcard/caption with matching JSON
- [x] Frontend state and export use itinerary JSON structure as-is
- [x] /export/pdf produces PDF containing itinerary place names and map snapshot
- [x] Docker-compose spins up backend, frontend, ml-service, mongo, redis

## Development Notes

- Response time target: 3-5 seconds for itinerary generation
- Graceful degradation implemented for external API failures
- Security: Environment-stored API keys, HTTPS enforcement, input validation, rate limiting
- GDPR-ready: User data export and account deletion endpoints scaffolded

## License

MIT