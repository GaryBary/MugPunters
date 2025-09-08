from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, stocks, reports, portfolio, watchlist, analysis

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(stocks.router, prefix="/stocks", tags=["stocks"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
api_router.include_router(watchlist.router, prefix="/watchlist", tags=["watchlist"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
