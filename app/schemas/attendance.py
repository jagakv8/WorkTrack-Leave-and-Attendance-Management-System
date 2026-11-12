from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date, datetime


class AttendanceLocation(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    attendance_date: date
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    check_in_distance_meters: Optional[float] = None
    check_out_distance_meters: Optional[float] = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class AttendanceReportResponse(BaseModel):
    employee_id: int
    employee_code: str
    employee_name: str
    department: Optional[str] = None
    attendance_date: date
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    status: str
