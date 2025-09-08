from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter()


@router.get("/")
async def get_reports(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve investment reports.
    """
    return {"message": "Reports endpoint - to be implemented"}


@router.post("/")
async def create_report(
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Create new investment report.
    """
    return {"message": "Create report endpoint - to be implemented"}


@router.get("/{report_id}")
async def get_report(
    report_id: str,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get a specific report.
    """
    return {"message": f"Report {report_id} endpoint - to be implemented"}
