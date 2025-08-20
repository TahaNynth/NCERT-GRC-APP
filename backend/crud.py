from sqlalchemy.orm import Session
import models, schemas
from datetime import date

def get_organizations(db: Session):
    return db.query(models.Organization).all()

def get_organization(db: Session, org_id: int):
    return db.query(models.Organization).filter(models.Organization.id == org_id).first()

def create_organization(db: Session, org_data: dict):
    db_org = models.Organization(**org_data)
    db.add(db_org)
    db.commit()
    db.refresh(db_org)
    return db_org

def get_clauses(db: Session):
    return db.query(models.Clause).all()

def create_clause(db: Session, clause_data: dict):
    db_clause = models.Clause(**clause_data)
    db.add(db_clause)
    db.commit()
    db.refresh(db_clause)
    return db_clause

def get_questions(db: Session):
    return db.query(models.Question).all()

def create_question(db: Session, question_data: dict):
    db_question = models.Question(**question_data)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def get_responses(db: Session, organization_id: int = None):
    query = db.query(models.Response)
    if organization_id:
        query = query.filter(models.Response.organization_id == organization_id)
    return query.all()

def create_response(db: Session, response_data: dict):
    db_response = models.Response(**response_data)
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    return db_response

def update_response(db: Session, response_id: int, response_data: dict):
    db_response = db.query(models.Response).filter(models.Response.id == response_id).first()
    if db_response:
        for key, value in response_data.items():
            setattr(db_response, key, value)
        db.commit()
        db.refresh(db_response)
    return db_response

def delete_response(db: Session, response_id: int):
    db_response = db.query(models.Response).filter(models.Response.id == response_id).first()
    if db_response:
        db.delete(db_response)
        db.commit()
        return True
    return False