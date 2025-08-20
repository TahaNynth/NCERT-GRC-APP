import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Organization, Response
from datetime import date
from typing import Optional
import re

router = APIRouter()

try:
    import google.generativeai as genai
except Exception:
    genai = None


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _extract_json_block(text: str) -> Optional[str]:
    if not text:
        return None
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if fence:
        return fence.group(1)
    stripped = text.strip()
    if stripped.startswith("{") and stripped.endswith("}"):
        return stripped
    return None

@router.get("/ai/compare")
def ai_compare(
    org1_id: int,
    org2_id: int,
    clause_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not genai:
        raise HTTPException(status_code=400, detail="AI not configured. Set GEMINI_API_KEY and install google-generativeai.")

    genai.configure(api_key=api_key)

    org1 = db.query(Organization).get(org1_id)
    org2 = db.query(Organization).get(org2_id)
    if not org1 or not org2:
        raise HTTPException(status_code=404, detail="One or both organizations not found")

    query = db.query(Response)
    if clause_id:
        query = query.filter(Response.clause_id == clause_id)
    if start_date:
        query = query.filter(Response.date >= start_date)
    if end_date:
        query = query.filter(Response.date <= end_date)
    q1 = query.filter(Response.organization_id == org1_id).all()
    q2 = query.filter(Response.organization_id == org2_id).all()

    def pack(responses):
        return [
            {
                "clause_id": r.clause_id,
                "question_id": r.question_id,
                "response_type": r.response_type.value if r.response_type else None,
                "comment": r.comment,
                "date": str(r.date),
            }
            for r in responses
        ]

    prompt = f"""
You are an analyst. Compare two organizations based on their survey responses.

Organization 1: {org1.name} (year_of_association={org1.year_of_association}) details={org1.details}
Responses: {pack(q1)}

Organization 2: {org2.name} (year_of_association={org2.year_of_association}) details={org2.details}
Responses: {pack(q2)}

Return STRICT JSON with keys: similarities (array of strings), differences (array of strings), summary (string). Do not include any markdown fences.
"""

    model = genai.GenerativeModel("gemini-1.5-flash")
    result = model.generate_content(prompt)
    text = (result.text or "").strip()

    import json
    data = None

    try:
        data = json.loads(text)
    except Exception:
        block = _extract_json_block(text)
        if block:
            try:
                data = json.loads(block)
            except Exception:
                data = None

    if not isinstance(data, dict):
        return {"similarities": [], "differences": [], "summary": text}

    similarities = data.get("similarities") or []
    differences = data.get("differences") or []
    summary = data.get("summary") or ""

    if not isinstance(similarities, list):
        similarities = [str(similarities)] if similarities else []
    if not isinstance(differences, list):
        differences = [str(differences)] if differences else []
    summary = str(summary)

    return {"similarities": similarities, "differences": differences, "summary": summary}