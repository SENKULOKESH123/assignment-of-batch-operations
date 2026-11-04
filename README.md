# Batch Operations

A React and Express sample app for listing training batches with server-side search, status and centre filters, and pagination.

## Requirements

- Node.js 18 or newer
- npm

## Run the backend

```bash
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:4000`. Check `http://localhost:4000/api/health` or `http://localhost:4000/api/batches?page=1&limit=5`.

## Run the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL Vite prints (normally `http://localhost:5173`). The frontend uses `http://localhost:4000/api` by default. To change it, create `frontend/.env` with `VITE_API_URL=http://localhost:4000/api`.

## API

`GET /api/batches?page=1&limit=5&search=full%20stack&status=Running&centre=London-HQ`

All query parameters are optional. Search matches batch code and course name. The response includes `data` and `pagination` fields. Records are sample data in `backend/data/batches.js`; no database is required.
