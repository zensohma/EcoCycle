from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.csrf import CSRFMiddleware
from app.modules.auth.router import router as auth_router
from app.modules.memberships.router import router as memberships_router
from app.modules.users.router import admin_users_router, users_router
from app.modules.waste_banks.router import manage_router, public_router
from app.modules.waste_banks.router import router as waste_banks_router

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(CSRFMiddleware)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(admin_users_router)
app.include_router(memberships_router)
app.include_router(public_router)
app.include_router(manage_router)
app.include_router(waste_banks_router)


@app.get("/api/v1/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}
