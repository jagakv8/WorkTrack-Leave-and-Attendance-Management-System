import csv
from io import StringIO
from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_employee, require_roles
from app.db.database import get_db
from app.models.employee import Employee
from app.models.attendance import Attendance
from app.schemas.attendance import (
    AttendanceLocation,
    AttendanceResponse,
    AttendanceReportResponse,
)
from app.services.geofence import is_inside_geofence

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance Management"],
)


@router.post("/check-in", response_model=AttendanceResponse)
def check_in(
    location: AttendanceLocation,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    inside, distance = is_inside_geofence(
        location.latitude, location.longitude
    )


    if not inside:
        raise HTTPException(
            status_code=403,
            detail=f"Check-in rejected. You are {distance} metres from the office. Maximum allowed distance is 50 metres.",
        )

    today = date.today()

    attendance = db.query(Attendance).filter(
        Attendance.employee_id == current_employee.id,
        Attendance.attendance_date == today,
    ).first()

    if attendance and attendance.check_in_time is not None:
        raise HTTPException(
            status_code=409,
            detail="You have already checked in today.",
        )

    if attendance is None:
        attendance = Attendance(
            employee_id=current_employee.id,
            attendance_date=today,
            status="present",
        )
        db.add(attendance)

    attendance.check_in_time = datetime.now()
    attendance.check_in_latitude = location.latitude
    attendance.check_in_longitude = location.longitude
    attendance.check_in_distance_meters = distance

    try:
        db.commit()
        db.refresh(attendance)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Attendance record already exists for today.",
        )

    return attendance


@router.post("/check-out", response_model=AttendanceResponse)
def check_out(
    location: AttendanceLocation,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    inside, distance = is_inside_geofence(
        location.latitude, location.longitude
    )

    if not inside:
        raise HTTPException(
            status_code=403,
            detail=f"Check-out rejected. You are {distance} metres from the office. Maximum allowed distance is 50 metres.",
        )

    today = date.today()

    attendance = db.query(Attendance).filter(
        Attendance.employee_id == current_employee.id,
        Attendance.attendance_date == today,
    ).first()

    if attendance is None or attendance.check_in_time is None:
        raise HTTPException(
            status_code=400,
            detail="You must check in before checking out.",
        )

    if attendance.check_out_time is not None:
        raise HTTPException(
            status_code=409,
            detail="You have already checked out today.",
        )

    attendance.check_out_time = datetime.now()
    attendance.check_out_latitude = location.latitude
    attendance.check_out_longitude = location.longitude
    attendance.check_out_distance_meters = distance

    db.commit()
    db.refresh(attendance)

    return attendance


@router.get("/my-history", response_model=list[AttendanceResponse])
def my_attendance_history(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
):
    return (
        db.query(Attendance)
        .filter(Attendance.employee_id == current_employee.id)
        .order_by(Attendance.attendance_date.desc())
        .all()
    )


@router.get("/reports", response_model=list[AttendanceReportResponse])
def attendance_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(require_roles("hr_admin")),
):
    if end_date < start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be earlier than start date.",
        )

    records = (
        db.query(Attendance, Employee)
        .join(Employee, Attendance.employee_id == Employee.id)
        .filter(
            Attendance.attendance_date >= start_date,
            Attendance.attendance_date <= end_date,
        )
        .order_by(
            Attendance.attendance_date.desc(),
            Employee.employee_code,
        )
        .all()
    )

    return [
        AttendanceReportResponse(
            employee_id=employee.id,
            employee_code=employee.employee_code,
            employee_name=f"{employee.first_name} {employee.last_name}",
            department=employee.department,
            attendance_date=attendance.attendance_date,
            check_in_time=attendance.check_in_time,
            check_out_time=attendance.check_out_time,
            status=attendance.status,
        )
        for attendance, employee in records
    ]


@router.get("/reports/export")
def export_attendance_report(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(require_roles("hr_admin")),
):
    if end_date < start_date:
        raise HTTPException(
            status_code=400,
            detail="End date cannot be earlier than start date.",
        )

    records = (
        db.query(Attendance, Employee)
        .join(Employee, Attendance.employee_id == Employee.id)
        .filter(
            Attendance.attendance_date >= start_date,
            Attendance.attendance_date <= end_date,
        )
        .order_by(
            Attendance.attendance_date.desc(),
            Employee.employee_code,
        )
        .all()
    )

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Employee ID",
        "Employee Code",
        "Employee Name",
        "Department",
        "Attendance Date",
        "Check In",
        "Check Out",
        "Status",
    ])

    for attendance, employee in records:
        writer.writerow([
            employee.id,
            employee.employee_code,
            f"{employee.first_name} {employee.last_name}",
            employee.department or "",
            attendance.attendance_date,
            attendance.check_in_time or "",
            attendance.check_out_time or "",
            attendance.status,
        ])

    output.seek(0)

    filename = f"attendance_report_{start_date}_{end_date}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )
