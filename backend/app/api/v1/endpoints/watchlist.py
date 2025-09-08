from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter()


@router.get("/")
async def get_watchlists(
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get user watchlists.
    """
    return {"message": "Watchlists endpoint - to be implemented"}


@router.post("/")
async def create_watchlist(
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Create new watchlist.
    """
    return {"message": "Create watchlist endpoint - to be implemented"}


@router.post("/{watchlist_id}/stocks")
async def add_stock_to_watchlist(
    watchlist_id: str,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Add stock to watchlist.
    """
    return {"message": f"Add stock to watchlist {watchlist_id} - to be implemented"}
