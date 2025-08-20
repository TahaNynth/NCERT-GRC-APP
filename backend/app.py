from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, init_db
import models, schemas, crud
import uvicorn
from comparison import router as comparison_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from ai_compare import router as ai_router
from typing import Optional
from datetime import date

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

@app.put("/responses/{response_id}", response_model=schemas.Response)
def update_response(response_id: int, response: schemas.ResponseCreate, db: Session = Depends(get_db)):
    updated_response = crud.update_response(db, response_id, response)
    if not updated_response:
        raise HTTPException(status_code=404, detail="Response not found")
    return updated_response

@app.delete("/responses/{response_id}")
def delete_response(response_id: int, db: Session = Depends(get_db)):
    success = crud.delete_response(db, response_id)
    if not success:
        raise HTTPException(status_code=404, detail="Response not found")
    return {"message": "Response deleted successfully"}

@app.get("/chart-data/yes-no")
def get_yes_no_chart_data(db: Session = Depends(get_db)):
    """Get aggregated Yes/No/Not applicable response data for all organizations"""
    from sqlalchemy import func, case  # import case here

    results = db.query(
        models.Organization.name,
        func.sum(
            case(
                (models.Response.response_type == "Yes", 1),
                else_=0
            )
        ).label("Yes"),
        func.sum(
            case(
                (models.Response.response_type == "No", 1),
                else_=0
            )
        ).label("No"),
        func.sum(
            case(
                (models.Response.response_type == "Not applicable", 1),
                else_=0
            )
        ).label("Not applicable"),
        func.count(models.Response.id).label("Total")
    ).join(
        models.Response, models.Organization.id == models.Response.organization_id, isouter=True
    ).group_by(
        models.Organization.id, models.Organization.name
    ).all()

    chart_data = []
    for org_name, yes_count, no_count, not_applicable_count, total in results:
        if total > 0:  # Only include organizations with responses
            chart_data.append({
                "name": org_name,
                "Yes": yes_count or 0,
                "No": no_count or 0,
                "Not applicable": not_applicable_count or 0,
                "Total": total
            })

    return chart_data


@app.get("/chart-data/yes-no-comparison")
def get_yes_no_comparison_chart_data(
    org1_id: int,
    org2_id: int,
    clause_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get Yes/No/Not applicable/NoResponse comparison data for two specific organizations"""
    from sqlalchemy import func, case

    org1 = db.query(models.Organization).get(org1_id)
    org2 = db.query(models.Organization).get(org2_id)
    if not org1 or not org2:
        raise HTTPException(status_code=404, detail="One or both organizations not found")

    # Get total questions (filtered by clause if provided)
    total_query = db.query(func.count(models.Question.id))
    if clause_id:
        total_query = total_query.filter(models.Question.clause_id == clause_id)
    total_questions = total_query.scalar() or 0

    def get_counts(org_id):
        yes_query = db.query(func.count(func.distinct(models.Response.question_id))).filter(
            models.Response.organization_id == org_id,
            models.Response.response_type == "Yes"
        )
        no_query = db.query(func.count(func.distinct(models.Response.question_id))).filter(
            models.Response.organization_id == org_id,
            models.Response.response_type == "No"
        )
        not_applicable_query = db.query(func.count(func.distinct(models.Response.question_id))).filter(
            models.Response.organization_id == org_id,
            models.Response.response_type == "Not applicable"
        )
        total_resp_query = db.query(func.count(func.distinct(models.Response.question_id))).filter(
            models.Response.organization_id == org_id
        )

        if clause_id:
            yes_query = yes_query.filter(models.Response.clause_id == clause_id)
            no_query = no_query.filter(models.Response.clause_id == clause_id)
            not_applicable_query = not_applicable_query.filter(models.Response.clause_id == clause_id)
            total_resp_query = total_resp_query.filter(models.Response.clause_id == clause_id)
        if start_date:
            yes_query = yes_query.filter(models.Response.date >= start_date)
            no_query = no_query.filter(models.Response.date >= start_date)
            not_applicable_query = not_applicable_query.filter(models.Response.date >= start_date)
            total_resp_query = total_resp_query.filter(models.Response.date >= start_date)
        if end_date:
            yes_query = yes_query.filter(models.Response.date <= end_date)
            no_query = no_query.filter(models.Response.date <= end_date)
            not_applicable_query = not_applicable_query.filter(models.Response.date <= end_date)
            total_resp_query = total_resp_query.filter(models.Response.date <= end_date)

        yes_count = yes_query.scalar() or 0
        no_count = no_query.scalar() or 0
        not_applicable_count = not_applicable_query.scalar() or 0
        total_responses = total_resp_query.scalar() or 0
        no_response = max(0, total_questions - total_responses)

        return yes_count, no_count, not_applicable_count, no_response

    yes1, no1, na1, nr1 = get_counts(org1_id)
    yes2, no2, na2, nr2 = get_counts(org2_id)

    chart_data = [
        {"name": "Yes", org1.name: yes1, org2.name: yes2},
        {"name": "No", org1.name: no1, org2.name: no2},
        {"name": "Not Applicable", org1.name: na1, org2.name: na2},
        {"name": "No Response", org1.name: nr1, org2.name: nr2},
    ]

    return chart_data


app.include_router(comparison_router)
app.include_router(ai_router)

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)