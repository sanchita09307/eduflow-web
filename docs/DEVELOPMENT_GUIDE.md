# EduFlow Local Development & Deployment Guide

## Quick Start (Web Application)

### 1. Run Development Server
```bash
npm install
npm run dev
```
Access the application at `http://localhost:3000`.

### 2. Run Python FastAPI Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API Swagger documentation is available at `http://localhost:8000/docs`.

### 3. Run Backend Unit Tests
```bash
pytest backend/tests
```

### 4. Build Production Bundle
```bash
npm run build
```
