from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_employee, require_roles
from app.db.database import get_db
from app.models.employee import Employee
from app.services.security import hash_password
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeResponse,
    EmployeeUpdate,
)

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.post(
    "/",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_employee(
    employee_data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(require_roles("hr_admin")),
):
    employee_data_dict = employee_data.model_dump(
        exclude={"temporary_password"}
    )

    employee = Employee(
        **employee_data_dict,
        password_hash=hash_password(employee_data.temporary_password),
        must_change_password=True,
    )

    db.add(employee)

    try:
        db.commit()
        db.refresh(employee)
        return employee
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee code or email already exists.",
        )


@router.get("/", response_model=list[EmployeeResponse])
def get_employees(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(require_roles("hr_admin")),
):
    return db.query(Employee).order_by(Employee.id).all()


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    if current_employee.id != employee_id and current_employee.role != "hr_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own employee profile.",
        )

    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    return employee


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    employee_data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(require_roles("hr_admin")),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    update_data = employee_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(employee, field, value)

    try:
        db.commit()
        db.refresh(employee)
        return employee
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email address already exists.",
        )


@router.patch(
    "/{employee_id}/deactivate",
    response_model=EmployeeResponse,
)
def deactivate_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(require_roles("hr_admin")),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    if not employee.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee is already inactive.",
        )

    employee.is_active = False

    db.commit()
    db.refresh(employee)

    return employee


@router.patch(
    "/{employee_id}/activate",
    response_model=EmployeeResponse,
)
def activate_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(require_roles("hr_admin")),
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()

    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found.",
        )

    if employee.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee is already active.",
        )

    employee.is_active = True
    db.commit()
    db.refresh(employee)

    return employee


@router.get("/me/profile", response_model=EmployeeResponse)
def get_my_profile(
    current_employee: Employee = Depends(get_current_employee),
):
    return current_employee
