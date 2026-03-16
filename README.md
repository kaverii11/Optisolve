# OptiSolve

An intelligent support ticket orchestration system that combines AI automation with human agents.

---

## Frontend

Built with **React + Vite**, providing fast HMR and ESLint support.

### Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Two official Vite plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) — uses Babel for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) — uses SWC for Fast Refresh

---

## Running the Backend

### 1. Clone the repository

```bash
git clone <repo-url>
cd Optisolve
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
```

```bash
# Linux / Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create the environment file // not needed rn 

Create a `.env` file in the project root and add:

```env
OPENAI_API_KEY=your_api_key_here
SAMBANOVA_API_KEY=your_api_key_here
```

### 5. Run the backend server

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Open API docs

Visit: [http://localhost:8000/docs](http://localhost:8000/docs)
