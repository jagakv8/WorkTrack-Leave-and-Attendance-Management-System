from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class LeaveRequestCreate(BaseModel):
    leave_type: Literal["CL", "SL", "EL", "LWP"]
    start_date: date
    end_date: date
    reason: str = Field(min_length=5, max_length=1000)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("End date cannot be before start date.")

        return self


class LeaveRequestResponse(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    total_days: int
    reason: str
    status: str

    model_config = {"from_attributes": True}


class LeaveDecision(BaseModel):
    action: Literal["approve", "reject"]
    comments: str = Field(default="", max_length=1000)
