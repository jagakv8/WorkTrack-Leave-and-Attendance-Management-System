from getpass import getpass

from app.db.database import SessionLocal
from app.models.employee import Employee
from app.services.security import hash_password

db = SessionLocal()

try:
    users = [
        {
            "employee_code": "MGR001",
            "first_name": "Test",
            "last_name": "Manager",
            "email": "manager@example.com",
            "department": "Management",
            "designation": "Manager",
            "role": "manager",
        },
        {
            "employee_code": "HR001",
            "first_name": "Test",
            "last_name": "HR",
            "email": "hr@example.com",
            "department": "Human Resources",
            "designation": "HR Admin",
            "role": "hr_admin",
        },
    ]

    for user in users:
        existing = db.query(Employee).filter(
            Employee.employee_code == user["employee_code"]
        ).first()

        if existing:
            print(user["employee_code"], "already exists; skipping.")
            continue

        password = getpass(
            f"Set password for {user['employee_code']} (minimum 12 characters): "
        )

        if len(password) < 12:
            raise ValueError("Password must contain at least 12 characters.")

        user["password_hash"] = hash_password(password)
        db.add(Employee(**user))
        db.flush()

        print(user["employee_code"], "created successfully.")

    db.commit()

except Exception:
    db.rollback()
    raise

finally:
    db.close()
