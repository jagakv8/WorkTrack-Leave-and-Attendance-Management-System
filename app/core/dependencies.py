from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy.orm import Session

from app.core.token import verify_access_token
from app.db.database import get_db
from app.models.employee import Employee


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_employee(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Employee:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = verify_access_token(token)
        employee_code = payload.get("sub")

        if not employee_code:
            raise credentials_exception

    except InvalidTokenError:
        raise credentials_exception

    employee = db.query(Employee).filter(
        Employee.employee_code == employee_code
    ).first()

    if employee is None or not employee.is_active:
        raise credentials_exception

    return employee


def require_roles(*allowed_roles: str):
    def role_checker(
        current_employee: Employee = Depends(get_current_employee)
    ) -> Employee:

        if current_employee.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )

        return current_employee

    return role_checker
