from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.employees import router as employee_router
from app.api.auth import router as auth_router
from app.api.test_protected import router as protected_router
from app.api.leaves import router as leave_router
from app.api.approvals import router as approval_router
from app.api.attendance import router as attendance_router
from app.api.dashboard import router as dashboard_router
from app.api.hr import router as hr_router

app = FastAPI(
    title="Leave and Attendance Management System",
    description="Employee leave requests and attendance management API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employee_router)
app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(leave_router)
app.include_router(approval_router)
app.include_router(attendance_router)
app.include_router(dashboard_router)
app.include_router(hr_router)


@app.get("/")
def home():
    return {
        "message": "Leave and Attendance Management System API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
