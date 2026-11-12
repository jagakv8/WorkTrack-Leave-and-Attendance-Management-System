import getpass

from app.db.database import SessionLocal
from app.models.employee import Employee
from app.services.security import hash_password


def main():
    employee_code = "EMP001"

    db = SessionLocal()

    try:
        employee = db.query(Employee).filter(
            Employee.employee_code == employee_code
        ).first()

        if not employee:
            print("Employee EMP001 was not found.")
            return

        if not employee.is_active:
            print("This employee account is inactive.")
            return

        password = getpass.getpass("Enter a new password: ")
        confirm_password = getpass.getpass("Confirm password: ")

        if len(password) < 12:
            print("Password must contain at least 12 characters.")
            return

        if password != confirm_password:
            print("Passwords do not match.")
            return

        employee.password_hash = hash_password(password)
        db.commit()

        print("Password successfully set for EMP001.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
