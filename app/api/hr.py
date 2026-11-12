from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.db.database import get_db
from app.models.employee import Employee
from app.models.leave import LeaveRequest
from app.models.leave_balance import LeaveBalance
from app.services.geofence import (
    OFFICE_LATITUDE,
    OFFICE_LONGITUDE,
    GEOFENCE_RADIUS_METERS,
)

router = APIRouter(prefix="/hr", tags=["HR Management"])


@router.get("/leave-requests")
def all_leave_requests(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(require_roles("hr_admin")),
):
    rows = (
        db.query(LeaveRequest, Employee)
        .join(Employee, LeaveRequest.employee_id == Employee.id)
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )
    return [
        {
            "id": leave.id,
            "employee_id": employee.id,
            "employee_code": employee.employee_code,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "leave_type": leave.leave_type,
            "start_date": leave.start_date.isoformat(),
            "end_date": leave.end_date.isoformat(),
            "total_days": leave.total_days,
            "reason": leave.reason,
            "status": leave.status,
            "created_at": leave.created_at.isoformat() if leave.created_at else None,
        }
        for leave, employee in rows
    ]


@router.get("/leave-balances")
def all_leave_balances(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(require_roles("hr_admin")),
):
    rows = (
        db.query(LeaveBalance, Employee)
        .join(Employee, LeaveBalance.employee_id == Employee.id)
        .order_by(Employee.employee_code, LeaveBalance.leave_type)
        .all()
    )
    return [
        {
            "employee_id": employee.id,
            "employee_code": employee.employee_code,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "department": employee.department,
            "leave_type": balance.leave_type,
            "total_days": balance.total_days,
            "used_days": balance.used_days,
            "remaining_days": balance.remaining_days,
        }
        for balance, employee in rows
    ]


@router.get("/settings")
def hr_settings(
    current_employee: Employee = Depends(require_roles("hr_admin")),
):
    return {
        "office_latitude": OFFICE_LATITUDE,
        "office_longitude": OFFICE_LONGITUDE,
        "geofence_radius_meters": GEOFENCE_RADIUS_METERS,
        "attendance_location_verification": True,
        "leave_approval_workflow": ["Manager", "HR Final Approval"],
    }
