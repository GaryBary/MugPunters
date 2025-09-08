from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter()


@router.get("/")
async def get_portfolio(
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get user portfolio.
    """
    return {"message": "Portfolio endpoint - to be implemented"}


@router.post("/holdings")
async def add_holding(
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Add holding to portfolio.
    """
    return {"message": "Add holding endpoint - to be implemented"}


@router.get("/performance")
async def get_portfolio_performance(
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get portfolio performance metrics.
    """
    return {"message": "Portfolio performance endpoint - to be implemented"}
