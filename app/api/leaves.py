from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_employee
from app.db.database import get_db
from app.models.employee import Employee
from app.models.leave import LeaveRequest
from app.models.leave_balance import LeaveBalance
from app.schemas.leave import LeaveRequestCreate, LeaveRequestResponse


router = APIRouter(
    prefix="/leaves",
    tags=["Leave Management"],
)


@router.post(
    "/apply",
    response_model=LeaveRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def apply_for_leave(
    leave_data: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    if not current_employee.is_active:
        raise HTTPException(status_code=403, detail="Inactive account.")

    if leave_data.start_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Leave cannot start in the past.",
        )

    total_days = (
        leave_data.end_date - leave_data.start_date
    ).days + 1

    balance = db.query(LeaveBalance).filter(
        LeaveBalance.employee_id == current_employee.id,
        LeaveBalance.leave_type == leave_data.leave_type,
    ).first()

    if leave_data.leave_type != "LWP":
        if balance is None:
            raise HTTPException(
                status_code=400,
                detail="Leave balance not configured for this leave type.",
            )

        if balance.remaining_days < total_days:
            raise HTTPException(
                status_code=400,
                detail="Insufficient leave balance.",
            )

    leave_request = LeaveRequest(
        employee_id=current_employee.id,
        leave_type=leave_data.leave_type,
        start_date=leave_data.start_date,
        end_date=leave_data.end_date,
        total_days=total_days,
        reason=leave_data.reason,
        status="pending_manager",
    )

    db.add(leave_request)
    db.commit()
    db.refresh(leave_request)

    return leave_request


@router.get(
    "/my-requests",
    response_model=list[LeaveRequestResponse],
)
def get_my_leave_requests(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    return (
        db.query(LeaveRequest)
        .filter(LeaveRequest.employee_id == current_employee.id)
        .order_by(LeaveRequest.created_at.desc())
        .all()
    )


@router.get("/my-balances")
def get_my_leave_balances(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    balances = db.query(LeaveBalance).filter(
        LeaveBalance.employee_id == current_employee.id
    ).all()

    return [
        {
            "leave_type": balance.leave_type,
            "total_days": balance.total_days,
            "used_days": balance.used_days,
            "remaining_days": balance.remaining_days,
        }
        for balance in balances
    ]
