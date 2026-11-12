from app.db.database import SessionLocal
from app.models.employee import Employee
from app.models.leave_balance import LeaveBalance

db = SessionLocal()

leave_allocations = {
    "CL": 12,
    "SL": 12,
    "EL": 15,
}

try:
    employee = db.query(Employee).filter(
        Employee.employee_code == "EMP001"
    ).first()

    if employee is None:
        raise ValueError("EMP001 employee not found.")

    for leave_type, total_days in leave_allocations.items():
        balance = db.query(LeaveBalance).filter(
            LeaveBalance.employee_id == employee.id,
            LeaveBalance.leave_type == leave_type,
        ).first()

        if balance is None:
            balance = LeaveBalance(
                employee_id=employee.id,
                leave_type=leave_type,
                total_days=total_days,
                used_days=0,
                remaining_days=total_days,
            )
            db.add(balance)

    db.commit()

    print("Leave balances configured for EMP001.")

    balances = db.query(LeaveBalance).filter(
        LeaveBalance.employee_id == employee.id
    ).all()

    for balance in balances:
        print(
            balance.leave_type,
            "Total:", balance.total_days,
            "Used:", balance.used_days,
            "Remaining:", balance.remaining_days,
        )

except Exception:
    db.rollback()
    raise

finally:
    db.close()
