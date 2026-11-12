from sqlalchemy import (
    Column,
    Integer,
    Date,
    DateTime,
    Float,
    String,
    ForeignKey,
    UniqueConstraint,
    func,
)

from app.db.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    __table_args__ = (
        UniqueConstraint(
            "employee_id",
            "attendance_date",
            name="unique_employee_attendance_date",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False,
    )

    attendance_date = Column(Date, nullable=False)

    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)

    check_in_latitude = Column(Float, nullable=True)
    check_in_longitude = Column(Float, nullable=True)

    check_out_latitude = Column(Float, nullable=True)
    check_out_longitude = Column(Float, nullable=True)

    check_in_distance_meters = Column(Float, nullable=True)
    check_out_distance_meters = Column(Float, nullable=True)

    status = Column(
        String(20),
        nullable=False,
        default="present",
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
    )
