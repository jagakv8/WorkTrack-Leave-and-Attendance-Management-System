from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.db.database import get_db
from app.models.employee import Employee
from app.models.attendance import Attendance
from app.models.leave import LeaveRequest
from app.schemas.dashboard import HRDashboardResponse


router = APIRouter(
    prefix="/dashboard",
    tags=["HR Dashboard"],
)


@router.get("/hr", response_model=HRDashboardResponse)
def get_hr_dashboard(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(
        require_roles("hr_admin")
    ),
):
    today = date.today()

    total_employees = db.query(Employee).filter(
        Employee.is_active.is_(True)
    ).count()

    present_today = db.query(Attendance).join(
        Employee,
        Attendance.employee_id == Employee.id,
    ).filter(
        Attendance.attendance_date == today,
        Attendance.check_in_time.isnot(None),
        Employee.is_active.is_(True),
    ).count()

    absent_today = max(
        total_employees - present_today,
        0,
    )

    pending_leave_requests = db.query(LeaveRequest).filter(
        LeaveRequest.status.in_([
            "pending_manager",
            "pending_hr",
        ])
    ).count()

    approved_leave_requests = db.query(LeaveRequest).filter(
        LeaveRequest.status == "approved"
    ).count()

    attendance_percentage = (
        round((present_today / total_employees) * 100, 2)
        if total_employees > 0
        else 0.0
    )

    return HRDashboardResponse(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today,
        pending_leave_requests=pending_leave_requests,
        approved_leave_requests=approved_leave_requests,
        attendance_percentage=attendance_percentage,
    )
