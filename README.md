# NCERT-WEB-APP

This project consists of two parts:
- **Frontend** (React)
- **Backend** (FastAPI)

Follow the steps below to run the application.

---

## 🚀 How to Run

```bash
# -------------------------
# Frontend
# -------------------------
cd frontend
npm install   # only needed the first time
npm start


# -------------------------
# Backend (Windows)
# -------------------------
cd backend
.\venv\Scripts\activate
uvicorn app:app --reload


# -------------------------
# Backend (Linux/Mac)
# -------------------------
cd backend
source venv/bin/activate
uvicorn app:app --reload
