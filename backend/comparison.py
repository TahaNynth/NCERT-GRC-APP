from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Response, Organization, Clause, Question
from typing import List, Optional
from datetime import date

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/compare")
def compare_surveys(
    organization_ids: Optional[List[int]] = Query(None),
    clause_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    if start_date and end_date and end_date < start_date:
        raise HTTPException(status_code=400, detail="end_date must be >= start_date")

    query = db.query(Response)
    if organization_ids:
        query = query.filter(Response.organization_id.in_(organization_ids))
    if clause_id:
        query = query.filter(Response.clause_id == clause_id)
    if start_date:
        query = query.filter(Response.date >= start_date)
    if end_date:
        query = query.filter(Response.date <= end_date)

    results = query.all()
    return [
        {
            "organization_id": r.organization_id,
            "clause_id": r.clause_id,
            "question_id": r.question_id,
            "response_text": r.response_text,
            "date": r.date
        } for r in results
    ]