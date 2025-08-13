from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, init_db
import models, schemas, crud
import uvicorn
from comparison import router as comparison_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from ai_compare import router as ai_router

load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency to get DB session

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {"message": "NCERT Survey API is running."}

# Organization Endpoints
@app.get("/organizations", response_model=list[schemas.Organization])
def list_organizations(db: Session = Depends(get_db)):
    return crud.get_organizations(db)

@app.get("/organizations/{org_id}", response_model=schemas.Organization)
def get_organization(org_id: int, db: Session = Depends(get_db)):
    org = crud.get_organization(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@app.post("/organizations", response_model=schemas.Organization)
def add_organization(org: schemas.OrganizationCreate, db: Session = Depends(get_db)):
    return crud.create_organization(db, org)

# Clause Endpoints
@app.get("/clauses", response_model=list[schemas.Clause])
def list_clauses(db: Session = Depends(get_db)):
    return crud.get_clauses(db)

@app.post("/clauses", response_model=schemas.Clause)
def add_clause(clause: schemas.ClauseCreate, db: Session = Depends(get_db)):
    return crud.create_clause(db, clause)

# Question Endpoints
@app.get("/questions", response_model=list[schemas.Question])
def list_questions(db: Session = Depends(get_db)):
    return crud.get_questions(db)

@app.post("/questions", response_model=schemas.Question)
def add_question(question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    return crud.create_question(db, question)

# Response Endpoints
@app.get("/responses", response_model=list[schemas.Response])
def list_responses(organization_id: int = None, db: Session = Depends(get_db)):
    return crud.get_responses(db, organization_id)

@app.post("/responses", response_model=schemas.Response)
def add_response(response: schemas.ResponseCreate, db: Session = Depends(get_db)):
    return crud.create_response(db, response)

app.include_router(comparison_router)
app.include_router(ai_router)

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)