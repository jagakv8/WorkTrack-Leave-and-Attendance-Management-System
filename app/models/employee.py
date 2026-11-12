from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    func,
)

from app.db.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String(20), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    department = Column(String(100), nullable=True)
    designation = Column(String(100), nullable=True)
    role = Column(String(20), nullable=False, default="employee")
    is_active = Column(Boolean, default=True)
    password_hash = Column(String(255), nullable=True)
    must_change_password = Column(Boolean, nullable=False, default=False, server_default="false")
    created_at = Column(DateTime, server_default=func.now())
