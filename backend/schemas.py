from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class OrganizationBase(BaseModel):
    name: str
    year_of_association: int
    details: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class Organization(OrganizationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ClauseBase(BaseModel):
    name: str

class ClauseCreate(ClauseBase):
    pass

class Clause(ClauseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class QuestionBase(BaseModel):
    text: str
    clause_id: int

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class ResponseBase(BaseModel):
    organization_id: int
    clause_id: int
    question_id: int
    response_text: str
    date: date

class ResponseCreate(ResponseBase):
    pass

class Response(ResponseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)