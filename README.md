# 🏢 Leave and Attendance Management System(WeWork)

A web-based Human Resource Management System (HRMS) designed to manage employee attendance, leave requests, approval workflows, and HR reporting for companies with 51–200 employees.

## 🎯 Project Overview

The system will provide separate dashboards for employees, managers, and HR administrators. It will use GPS-based geofencing to restrict attendance check-in and check-out to within 50 metres of the registered company office.

## ✨ Key Features

### 👤 Employee Portal
- Secure employee login.
- Daily check-in and check-out.
- GPS-based office location verification.
- Attendance history and working-hour summaries.
- Apply for leave and track approval status.
- View available leave balances.

### 📍 GPS-Based Attendance
- Single registered company office.
- 50-metre permitted attendance radius.
- Location verification during check-in and check-out.
- Block attendance attempts outside the permitted radius.
- Server-recorded attendance timestamps.
- Location requested only when recording attendance.

### 👨‍💼 Manager Dashboard
- View team attendance.
- Review employee leave requests.
- Approve or reject requests with comments.
- Track pending approvals.

### 🛡️ HR & Admin Dashboard
- Manage employee accounts and departments.
- Assign reporting managers.
- Provide final approval for manager-approved leave.
- Configure leave types and balances.
- Review attendance corrections.
- Generate monthly attendance and leave reports.

### 📊 Reports
- Daily and monthly attendance summaries.
- Employee-wise attendance records.
- Leave usage and remaining balances.
- Downloadable CSV reports.
- Payroll-ready attendance summaries.

## 🔄 Leave Approval Workflow

1. Employee submits a leave request.
2. Manager reviews the request.
3. Manager approves or rejects it.
4. Manager-approved requests go to HR.
5. HR provides final approval or rejection.
6. Approved leave is reflected in the employee's records and balance.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Database Migrations | Alembic |
| Validation | Pydantic |
| Testing | Pytest |
| Reports | CSV Export |
| Future Mobile App | API-based integration |

## 🔐 Security

- Role-based access for employees, managers, and HR.
- Secure password hashing and session management.
- Server-side GPS distance validation.
- Protection against duplicate attendance records.
- Audit logs for administrative changes.
- Restricted access to employee and location data.
- HTTPS and database backups for deployment.
- No continuous employee location tracking.

**Geofencing limitation:** Browser location can be inaccurate or spoofed. Location verification helps enforce the attendance policy but cannot guarantee proof of physical presence.

## 🗃️ Planned Database Modules

- Users and authentication
- Employees and departments
- Office locations and geofence settings
- Attendance records
- Leave types and balances
- Leave requests and approval history
- Company holidays
- Audit logs
- Attendance and leave reports

## 🚀 Development Roadmap

- [ ] Project setup and database integration
- [ ] Employee login and role-based access
- [ ] Employee and department management
- [ ] GPS-based check-in and check-out
- [ ] Server-side 50-metre geofence validation
- [ ] Attendance history and working-hour calculations
- [ ] Leave applications and balance management
- [ ] Manager and HR approval workflow
- [ ] Monthly attendance and leave reports
- [ ] Automated testing and security checks
- [ ] Deployment and documentation
- [ ] Future Android and iOS application integration

## 💻 Local Setup

Local installation and execution instructions will be added as the application is implemented.

The planned development environment includes Python, Node.js, and PostgreSQL.

## 🔮 Future Enhancements

- Dedicated Android and iOS applications.
- Email notifications for leave approvals.
- Company holiday calendar and work schedules.
- Attendance analytics dashboard.
- Payroll integration.
- Support for multiple office branches.

## 📌 Project Status

**Status:** Initial planning and development.

The features in this README describe the intended functionality. They are not claimed to be implemented until development and testing are complete.

## 👨‍💻 Author

Jagadeesh K V
---

*The goal is to simplify HR operations, improve attendance recordkeeping, and provide a secure, maintainable system for company workforce management.*
