from sqlalchemy.orm import Session
import models, schemas
from datetime import date

def get_organizations(db: Session):
    return db.query(models.Organization).all()

def get_organization(db: Session, org_id: int):
    return db.query(models.Organization).filter(models.Organization.id == org_id).first()

def create_organization(db: Session, org: schemas.OrganizationCreate):
    db_org = models.Organization(**org.dict())
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org

def get_clauses(db: Session):
    return db.query(models.Clause).all()

def create_clause(db: Session, clause: schemas.ClauseCreate):
    db_clause = models.Clause(**clause.dict())
    db.add(db_clause)
    db.commit()
    db.refresh(db_clause)
    return db_clause

def get_questions(db: Session):
    return db.query(models.Question).all()

def create_question(db: Session, question: schemas.QuestionCreate):
    db_question = models.Question(**question.dict())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def get_responses(db: Session, organization_id: int = None):
    query = db.query(models.Response)
    if organization_id:
        query = query.filter(models.Response.organization_id == organization_id)
    return query.all()

def create_response(db: Session, response: schemas.ResponseCreate):
    db_response = models.Response(**response.dict())
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    return db_response