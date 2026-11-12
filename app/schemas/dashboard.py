from pydantic import BaseModel


class HRDashboardResponse(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    pending_leave_requests: int
    approved_leave_requests: int
    attendance_percentage: float
