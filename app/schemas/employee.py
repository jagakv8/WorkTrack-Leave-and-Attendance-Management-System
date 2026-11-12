from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EmployeeCreate(BaseModel):
    employee_code: str = Field(min_length=3, max_length=20)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    temporary_password: str = Field(min_length=8, max_length=128)
    department: Optional[str] = None
    designation: Optional[str] = None


class EmployeeResponse(BaseModel):
    id: int
    employee_code: str
    first_name: str
    last_name: str
    email: EmailStr
    department: Optional[str] = None
    designation: Optional[str] = None
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = Field(
        default=None, min_length=1, max_length=100
    )
    last_name: Optional[str] = Field(
        default=None, min_length=1, max_length=100
    )
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    designation: Optional[str] = None



class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=128)


class PasswordReset(BaseModel):
    new_password: str = Field(min_length=8, max_length=128)
