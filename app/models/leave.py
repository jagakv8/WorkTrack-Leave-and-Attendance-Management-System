from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    CheckConstraint,
    func,
)

from app.db.database import Base


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    __table_args__ = (
        CheckConstraint(
            "end_date >= start_date",
            name="check_leave_dates",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False,
    )

    leave_type = Column(String(20), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_days = Column(Integer, nullable=False)

    reason = Column(Text, nullable=False)

    status = Column(
        String(30),
        nullable=False,
        default="pending_manager",
    )

    manager_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True,
    )

    manager_comments = Column(Text, nullable=True)
    manager_action_at = Column(DateTime, nullable=True)

    hr_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True,
    )

    hr_comments = Column(Text, nullable=True)
    hr_action_at = Column(DateTime, nullable=True)

    created_at = Column(
        DateTime,
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
    )
