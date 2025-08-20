#!/usr/bin/env python3
"""
Simple test script to verify database creation
"""
import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import init_db
from models import Organization, Clause, Question, Response, ResponseType
from sqlalchemy.orm import Session
from database import SessionLocal

def test_database():
    """Test database creation and basic operations"""
    print("Testing database creation...")
    
    # Initialize database
    init_db()
    print("✓ Database initialized")
    
    # Test creating a simple organization
    db = SessionLocal()
    try:
        # Create test organization
        test_org = Organization(
            name="Test Organization",
            year_of_association=2024,
            details="Test details"
        )
        db.add(test_org)
        db.commit()
        print("✓ Organization created successfully")
        
        # Create test clause
        test_clause = Clause(
            name="test_clause",
            title="Test Clause Title"
        )
        db.add(test_clause)
        db.commit()
        print("✓ Clause created successfully")
        
        # Create test question
        test_question = Question(
            text="Test question text?",
            title="Test Question Title",
            clause_id=test_clause.id
        )
        db.add(test_question)
        db.commit()
        print("✓ Question created successfully")
        
        # Create test response
        test_response = Response(
            organization_id=test_org.id,
            clause_id=test_clause.id,
            question_id=test_question.id,
            response_type=ResponseType.YES,
            comment="Test comment",
            date="2024-01-01"
        )
        db.add(test_response)
        db.commit()
        print("✓ Response created successfully")
        
        print("\n🎉 All database operations successful!")
        print("Database schema is working correctly.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    test_database()

