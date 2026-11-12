from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import require_roles
from app.db.database import get_db
from app.models.employee import Employee
from app.models.leave import LeaveRequest
from app.models.leave_balance import LeaveBalance
from app.schemas.leave import LeaveDecision


router = APIRouter(
    prefix="/approvals",
    tags=["Leave Approvals"],
)


@router.get("/manager/pending")
def manager_pending_requests(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(
        require_roles("manager")
    ),
):
    return (
        db.query(LeaveRequest)
        .filter(LeaveRequest.status == "pending_manager")
        .order_by(LeaveRequest.created_at.asc())
        .all()
    )


@router.post("/manager/{request_id}/decision")
def manager_decision(
    request_id: int,
    decision: LeaveDecision,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(
        require_roles("manager")
    ),
):
    leave = db.query(LeaveRequest).filter(
        LeaveRequest.id == request_id
    ).with_for_update().first()

    if leave is None:
        raise HTTPException(status_code=404, detail="Leave request not found.")

    if leave.employee_id == current_employee.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot approve your own leave.",
        )

    if leave.status != "pending_manager":
        raise HTTPException(
            status_code=409,
            detail="This request is not awaiting manager approval.",
        )

    leave.manager_id = current_employee.id
    leave.manager_comments = decision.comments
    leave.manager_action_at = datetime.utcnow()

    if decision.action == "approve":
        leave.status = "pending_hr"
    else:
        leave.status = "rejected"

    db.commit()

    return {
        "message": "Manager decision recorded.",
        "request_id": leave.id,
        "status": leave.status,
    }


@router.get("/hr/pending")
def hr_pending_requests(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(
        require_roles("hr_admin")
    ),
):
    return (
        db.query(LeaveRequest)
        .filter(LeaveRequest.status == "pending_hr")
        .order_by(LeaveRequest.created_at.asc())
        .all()
    )


@router.post("/hr/{request_id}/decision")
def hr_decision(
    request_id: int,
    decision: LeaveDecision,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(
        require_roles("hr_admin")
    ),
):
    leave = db.query(LeaveRequest).filter(
        LeaveRequest.id == request_id
    ).with_for_update().first()

    if leave is None:
        raise HTTPException(status_code=404, detail="Leave request not found.")

    if leave.employee_id == current_employee.id:
        raise HTTPException(
            status_code=403,
            detail="You cannot approve your own leave.",
        )

    if leave.status != "pending_hr":
        raise HTTPException(
            status_code=409,
            detail="This request is not awaiting HR approval.",
        )

    # Check the balance again before final approval.
    balance = None

    if decision.action == "approve" and leave.leave_type != "LWP":
        balance = db.query(LeaveBalance).filter(
            LeaveBalance.employee_id == leave.employee_id,
            LeaveBalance.leave_type == leave.leave_type,
        ).with_for_update().first()

        if balance is None:
            raise HTTPException(
                status_code=400,
                detail="Employee leave balance not configured.",
            )

        if balance.remaining_days < leave.total_days:
            raise HTTPException(
                status_code=400,
                detail="Insufficient leave balance for final approval.",
            )

        balance.used_days += leave.total_days
        balance.remaining_days -= leave.total_days

    leave.hr_id = current_employee.id
    leave.hr_comments = decision.comments
    leave.hr_action_at = datetime.utcnow()

    if decision.action == "approve":
        leave.status = "approved"
    else:
        leave.status = "rejected"

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "message": "HR decision recorded.",
        "request_id": leave.id,
        "status": leave.status,
        "balance_deducted": (
            leave.total_days
            if decision.action == "approve"
            and leave.leave_type != "LWP"
            else 0
        ),
    }
