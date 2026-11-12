from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.employee import Employee
from app.services.security import verify_password, hash_password
from app.core.dependencies import get_current_employee, require_roles
from app.schemas.employee import PasswordChange, PasswordReset
from app.core.token import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Authenticate an employee and return a JWT access token."""

    employee = db.query(Employee).filter(
        Employee.email == form_data.username
    ).first()

    if not employee or not employee.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not employee.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This employee account is inactive"
        )

    if not verify_password(
        form_data.password,
        employee.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(
        data={
            "sub": employee.employee_code,
            "role": employee.role
        },
        expires_delta=timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "employee_code": employee.employee_code,
        "role": employee.role,
        "must_change_password": employee.must_change_password
    }



@router.post("/change-password")
def change_password(
    password_data: PasswordChange,
    current_employee: Employee = Depends(get_current_employee),
    db: Session = Depends(get_db),
):
    if not current_employee.password_hash or not verify_password(
        password_data.current_password,
        current_employee.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if password_data.current_password == password_data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password.",
        )

    current_employee.password_hash = hash_password(password_data.new_password)
    current_employee.must_change_password = False
    db.commit()

    return {"message": "Password changed successfully."}


@router.post("/reset-password/{employee_id}")
def reset_employee_password(
    employee_id: int,
    password_data: PasswordReset,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(require_roles("hr_admin")),
):
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    employee.password_hash = hash_password(password_data.new_password)
    employee.must_change_password = True
    db.commit()

    return {"message": "Employee password reset successfully."}
