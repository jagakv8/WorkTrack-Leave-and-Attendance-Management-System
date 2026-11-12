# WorkTrack – Leave and Attendance Management System

WorkTrack is a web-based leave and attendance management system designed to help organizations manage employee attendance, leave requests, approval workflows, and HR reporting from one place.

The application provides role-based experiences for **Employees**, **Managers**, and **HR Administrators**. Attendance check-in and check-out are protected by GPS geofencing, while leave requests follow a two-stage approval process.

## System Architecture

The following diagram illustrates the WorkTrack architecture, including the frontend, backend, database, authentication, GPS geofencing, and leave approval workflow.

![WorkTrack System Architecture](docs/architecture.png)

## Application screenshots

### HR dashboard

Workforce overview with attendance metrics, pending leave counts, and HR navigation.

![HR dashboard](docs/screenshots/hr-dashboard.png)

### Employee portal

Employee attendance workspace with geofence-based check-in/check-out and attendance history.

![Employee dashboard](docs/screenshots/employee-dashboard.png)

### Manager portal

Manager workspace for reviewing employee leave requests before HR's final decision.

![Manager dashboard](docs/screenshots/manager-dashboard.png)

## Features

### Employee
- Secure login with mandatory password change on first login.
- View personal attendance history.
- Check in and check out using the device's location.
- GPS geofence validation against the configured office location.
- Apply for leave and view personal leave requests.
- View leave balances by leave type.

### Manager
- View pending leave requests.
- Approve or reject employee leave requests.
- Forward manager-approved requests to HR for final approval.

### HR Administrator
- Manage employee records and employee account status.
- Create employee accounts and reset passwords.
- Review leave requests across the organization.
- Perform final approval or rejection of manager-approved requests.
- View leave balances across employees.
- View attendance reports with date filters.
- Export attendance reports as CSV.
- View office geofence and approval workflow settings.

### Attendance and geofencing
- Check-in and check-out require location verification.
- Attendance is accepted only within the configured geofence.
- The configured default geofence radius is **50 metres**.
- Attendance records retain location and distance information for verification.

## Approval workflow

```text
Employee submits leave request
             |
             v
       Manager review
          /     \
      Reject    Approve
                   |
                   v
              HR review
               /     \
           Reject   Approve
                       |
                       v
             Leave balance updated
```

A leave request is not finally approved until HR completes the second approval stage.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM and migrations | SQLAlchemy, Alembic |
| Data validation | Pydantic |
| Authentication | JWT-based authentication |
| Testing | Pytest |

## Project structure

```text
Leave and Attendance Management System/
├── alembic/                  # Database migration scripts
├── app/
│   ├── api/                  # FastAPI route modules
│   ├── core/                 # Authentication and shared dependencies
│   ├── db/                   # Database connection and database utilities
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic schemas
│   └── services/             # Business logic, including geofencing
├── frontend/
│   └── src/                  # React and TypeScript application
├── tests/                    # Automated tests
├── alembic.ini
├── requirements.txt
└── README.md
```

## Prerequisites

Install the following before running the application:

- Python 3.9 or later
- Node.js and npm
- PostgreSQL
- Git

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/jagakv8/Leave-and-Attendance-management-system.git
cd Leave-and-Attendance-management-system
```

### 2. Configure PostgreSQL

Create a PostgreSQL database for the application. For example, using `psql`:

```sql
CREATE DATABASE leave_management;
```

Make sure your PostgreSQL server is running and that you have a database user with access to this database.

### 3. Set up the Python backend

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root. Set the values for your local environment:

```env
DATABASE_URL=postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/leave_management
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET
OFFICE_LATITUDE=YOUR_OFFICE_LATITUDE
OFFICE_LONGITUDE=YOUR_OFFICE_LONGITUDE
GEOFENCE_RADIUS_METERS=50
```

Replace all placeholder values before starting the backend. Keep `.env` private: it is excluded from Git and must never be committed.

### 5. Apply database migrations

From the project root, with the virtual environment activated:

```bash
alembic upgrade head
```

### 6. Start the backend

From the project root:

```bash
uvicorn app.main:app --reload
```

The API runs at:

```text
http://127.0.0.1:8000
```

Interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### 7. Set up and start the frontend

Open a **second terminal window or tab**. From the project root:

```bash
cd frontend
npm install
npm run dev
```

Vite displays the local frontend URL in the terminal. The default URL is:

```text
http://localhost:5173
```

Keep both the backend and frontend terminals running while using the application.

## Configuration notes

- The office latitude and longitude define the centre of the attendance geofence.
- `GEOFENCE_RADIUS_METERS` controls the permitted distance from the office location.
- The frontend API client is configured to communicate with the local FastAPI backend at `http://127.0.0.1:8000`.
- For deployment, configure the API base URL and environment variables for the target environment. Do not use development secrets in production.

## Security considerations

- Authentication uses JWT bearer tokens.
- API endpoints enforce role-based access for protected actions.
- Passwords are stored as hashes, not as plain text.
- New employee accounts require a password change at first login.
- Environment secrets and database credentials must remain outside source control.
- GPS coordinates are used for attendance location verification. Use the system in accordance with applicable privacy and workplace policies.

## Testing

Run the backend test suite from the project root with the virtual environment activated:

```bash
pytest
```

## Important API areas

The backend exposes API routes for the following application areas:

| Area | Purpose |
|---|---|
| Authentication | Login and password change |
| Employees | Employee administration |
| Leaves | Leave application, personal requests, and balances |
| Approvals | Manager and HR approval stages |
| Attendance | Check-in, check-out, history, and reports |
| Dashboard | HR dashboard data |
| HR | Organization-wide leave views and HR settings |

For request and response details, run the backend and open `/docs`.

## Future enhancements

Potential next steps for the project include:

- Responsive mobile experience or a dedicated mobile application.
- Configurable leave policies and holiday calendars.
- More detailed analytics and downloadable HR reports.
- Notifications for leave submission, approval, and rejection.
- Deployment with production-grade secrets, HTTPS, and monitoring.

## Author

**Jagadeesh K V**

GitHub: [@jagakv8](https://github.com/jagakv8)

---

*WorkTrack is a portfolio project. Configure and validate security, privacy, and operational settings before using it with real employee data.*
