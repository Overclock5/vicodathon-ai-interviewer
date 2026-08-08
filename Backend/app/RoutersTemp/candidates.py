from fastapi import APIRouter

from app.services.candidate_loader import load_candidates

router = APIRouter(prefix="/api", tags=["Candidates"])


@router.get("/candidates")
def get_candidates():
    return load_candidates()