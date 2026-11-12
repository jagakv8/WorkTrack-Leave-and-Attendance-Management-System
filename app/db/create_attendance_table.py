from sqlalchemy import inspect

from app.db.database import Base, engine
from app.models.employee import Employee
from app.models.attendance import Attendance

Base.metadata.create_all(bind=engine)

inspector = inspect(engine)
tables = inspector.get_table_names()

if "attendance" in tables:
    print("SUCCESS: attendance table exists")
else:
    print("ERROR: attendance table is missing")
