from sqlalchemy import inspect

from app.db.database import Base, engine
from app.models.employee import Employee
from app.models.leave import LeaveRequest
from app.models.leave_balance import LeaveBalance

# Register all models and create any missing tables.
Base.metadata.create_all(bind=engine)

# Verify database tables.
inspector = inspect(engine)
tables = inspector.get_table_names()

print("Database table verification:")

for table in ["employees", "leave_requests", "leave_balances"]:
    if table in tables:
        print(f"SUCCESS: {table} exists")
    else:
        print(f"ERROR: {table} is missing")
