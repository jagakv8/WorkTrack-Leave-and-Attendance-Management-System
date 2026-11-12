from fastapi import APIRouter, Depends

from app.core.dependencies import (
    get_current_employee,
    require_roles,
)
from app.models.employee import Employee

router = APIRouter(
    prefix="/test",
    tags=["Authentication Tests"]
)


@router.get("/me")
def get_my_profile(
    employee: Employee = Depends(get_current_employee)
):
    return {
        "message": "Authentication successful",
        "employee_code": employee.employee_code,
        "role": employee.role,
    }


@router.get("/hr-only")
def hr_only(
    employee: Employee = Depends(
        require_roles("hr_admin")
    )
):
    return {
        "message": "HR access granted",
        "employee_code": employee.employee_code,
    }
