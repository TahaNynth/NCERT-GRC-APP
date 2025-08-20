#!/usr/bin/env python3
"""
Script to populate the database with sample data for testing
"""
import os
import sys
from datetime import date, timedelta
from sqlalchemy.orm import Session

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, init_db
from models import Organization, Clause, Question, Response, ResponseType
import crud

def populate_database():
    """Populate the database with sample data"""
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    try:
        print("Creating sample organizations...")
        
        # Create organizations
        orgs = [
            {"name": "Ministry of Human Rights", "year_of_association": 2020, "details": "Federal ministry"},
            {"name": "SECP", "year_of_association": 2019, "details": "Securities and Exchange Commission"},
            {"name": "NADRA", "year_of_association": 2021, "details": "National Database and Registration Authority"},
            {"name": "Punjab Home Department", "year_of_association": 2022, "details": "Provincial department"},
            {"name": "Ministry of Law and Justice", "year_of_association": 2020, "details": "Federal ministry"},
            {"name": "PEMRA", "year_of_association": 2021, "details": "Pakistan Electronic Media Regulatory Authority"},
            {"name": "KP ST&IT", "year_of_association": 2022, "details": "Khyber Pakhtunkhwa Science & Technology"},
            {"name": "Ministry of Religious Affairs", "year_of_association": 2020, "details": "Federal ministry"},
            {"name": "Ministry of Communication", "year_of_association": 2021, "details": "Federal ministry"},
            {"name": "Ministry of Planning", "year_of_association": 2020, "details": "Federal ministry"},
        ]
        
        created_orgs = []
        for org_data in orgs:
            org = crud.create_organization(db, org_data)
            created_orgs.append(org)
            print(f"Created organization: {org.name}")
        
        print("\nCreating sample clauses...")
        
        # Create clauses
        clauses = [
            {"name": "cyber_security", "title": "Cyber Security Implementation"},
            {"name": "data_protection", "title": "Data Protection & Privacy"},
            {"name": "incident_response", "title": "Incident Response & Recovery"},
            {"name": "access_control", "title": "Access Control & Authentication"},
            {"name": "risk_assessment", "title": "Risk Assessment & Management"},
        ]
        
        created_clauses = []
        for clause_data in clauses:
            clause = crud.create_clause(db, clause_data)
            created_clauses.append(clause)
            print(f"Created clause: {clause.title}")
        
        print("\nCreating sample questions...")
        
        # Create questions for each clause
        questions = [
            # Cyber Security Implementation
            {"text": "Does your organization have a dedicated cyber security team?", "title": "Cyber Security Team", "clause_id": 1},
            {"text": "Does higher management receive reports from cyber security team?", "title": "Management Reporting", "clause_id": 1},
            {"text": "Does top management participate in cyber security program?", "title": "Management Participation", "clause_id": 1},
            
            # Data Protection & Privacy
            {"text": "Has your organization developed data protection policies?", "title": "Data Protection Policies", "clause_id": 2},
            {"text": "Do you have a comprehensive data inventory?", "title": "Data Inventory", "clause_id": 2},
            {"text": "Are data protection trainings conducted regularly?", "title": "Data Protection Training", "clause_id": 2},
            
            # Incident Response & Recovery
            {"text": "Do you have an incident response plan?", "title": "Incident Response Plan", "clause_id": 3},
            {"text": "Are incident response drills conducted?", "title": "Response Drills", "clause_id": 3},
            {"text": "Do you have a disaster recovery plan?", "title": "Disaster Recovery", "clause_id": 3},
            
            # Access Control & Authentication
            {"text": "Do you use multi-factor authentication?", "title": "Multi-Factor Auth", "clause_id": 4},
            {"text": "Are access privileges reviewed regularly?", "title": "Access Review", "clause_id": 4},
            {"text": "Do you have a password policy?", "title": "Password Policy", "clause_id": 4},
            
            # Risk Assessment & Management
            {"text": "Do you conduct regular risk assessments?", "title": "Risk Assessments", "clause_id": 5},
            {"text": "Do you have a risk management framework?", "title": "Risk Framework", "clause_id": 5},
            {"text": "Are risks documented and tracked?", "title": "Risk Documentation", "clause_id": 5},
        ]
        
        created_questions = []
        for question_data in questions:
            question = crud.create_question(db, question_data)
            created_questions.append(question)
            print(f"Created question: {question.title}")
        
        print("\nCreating sample responses...")
        
        # Create sample responses
        base_date = date(2024, 1, 1)
        response_types = [ResponseType.YES, ResponseType.NO]
        
        response_count = 0
        for org in created_orgs:
            for question in created_questions:
                # Randomly assign Yes/No responses
                response_type = response_types[response_count % 2]
                comment = f"Sample response for {org.name} - {question.title}"
                
                response_data = {
                    "organization_id": org.id,
                    "clause_id": question.clause_id,
                    "question_id": question.id,
                    "response_type": response_type,
                    "comment": comment,
                    "date": base_date + timedelta(days=response_count)
                }
                
                crud.create_response(db, response_data)
                response_count += 1
                
                if response_count % 10 == 0:
                    print(f"Created {response_count} responses...")
        
        print(f"\nDatabase populated successfully!")
        print(f"- {len(created_orgs)} organizations")
        print(f"- {len(created_clauses)} clauses")
        print(f"- {len(created_questions)} questions")
        print(f"- {response_count} responses")
        
    except Exception as e:
        print(f"Error populating database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    populate_database()

