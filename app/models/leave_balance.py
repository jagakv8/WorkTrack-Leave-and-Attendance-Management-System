from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    CheckConstraint,
)

from app.db.database import Base


class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    __table_args__ = (
        UniqueConstraint(
            "employee_id",
            "leave_type",
            name="unique_employee_leave_type",
        ),
        CheckConstraint(
            "total_days >= 0 AND used_days >= 0",
            name="check_leave_balance_days",
        ),
        CheckConstraint(
            "used_days <= total_days",
            name="check_used_days",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False,
    )

    leave_type = Column(String(20), nullable=False)

    total_days = Column(Integer, nullable=False, default=0)

    used_days = Column(Integer, nullable=False, default=0)

    remaining_days = Column(Integer, nullable=False, default=0)
