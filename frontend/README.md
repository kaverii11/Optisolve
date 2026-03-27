# OptiSolve Frontend

## Run locally

```bash
cd frontend
npm install
npm run dev
```

By default it connects to `http://localhost:8000`.

To point to a different backend, create `.env` in `frontend/`:

```bash
VITE_API_BASE_URL=http://YOUR_IP:8000
```

## Two-laptop simulation

- Start backend + frontend on laptop A.
- Find laptop A IPv4 address (`ipconfig`).
- On laptop B open `http://<laptopA-ip>:5173`.
- Set frontend `.env` on laptop A to `VITE_API_BASE_URL=http://<laptopA-ip>:8000` if needed for external access.
