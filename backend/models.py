from sqlalchemy import Column, Integer, String, ForeignKey, Date, Text, Enum
from sqlalchemy.orm import relationship, declarative_base
import enum

Base = declarative_base()

class ResponseType(enum.Enum):
    YES = "Yes"
    NO = "No"

class Organization(Base):
    __tablename__ = 'organizations'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    year_of_association = Column(Integer, nullable=False)
    details = Column(Text)
    responses = relationship('Response', back_populates='organization')

class Clause(Base):
    __tablename__ = 'clauses'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    questions = relationship('Question', back_populates='clause')
    responses = relationship('Response', back_populates='clause')

class Question(Base):
    __tablename__ = 'questions'
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    title = Column(String, nullable=False)
    clause_id = Column(Integer, ForeignKey('clauses.id'))
    clause = relationship('Clause', back_populates='questions')
    responses = relationship('Response', back_populates='question')

class Response(Base):
    __tablename__ = 'responses'
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey('organizations.id'))
    clause_id = Column(Integer, ForeignKey('clauses.id'))
    question_id = Column(Integer, ForeignKey('questions.id'))
    response_type = Column(Enum(ResponseType), nullable=False)
    comment = Column(Text)
    date = Column(Date, nullable=False)
    organization = relationship('Organization', back_populates='responses')
    clause = relationship('Clause', back_populates='responses')
    question = relationship('Question', back_populates='responses')