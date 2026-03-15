import os
import sqlite3
import logging
from datetime import datetime, date
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Header, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use absolute path for database to avoid issues on different systems
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "attendance.db"

def get_db():
    conn = None
    try:
        conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        yield conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise
    finally:
        if conn:
            conn.close()

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "detail": "Internal Server Error"},
    )

def init_db():
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mobile TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            designation TEXT,
            department TEXT,
            join_date DATE,
            address TEXT,
            role TEXT DEFAULT 'staff',
            status TEXT DEFAULT 'active',
            salary REAL DEFAULT 0,
            total_leaves INTEGER DEFAULT 20
        )
    """)
    
    # Add columns if they don't exist
    columns = [
        ('email', 'TEXT'),
        ('designation', 'TEXT'),
        ('department', 'TEXT'),
        ('join_date', 'DATE'),
        ('address', 'TEXT'),
        ('role', "TEXT DEFAULT 'staff'"),
        ('status', "TEXT DEFAULT 'active'"),
        ('salary', 'REAL DEFAULT 0'),
        ('total_leaves', 'INTEGER DEFAULT 20')
    ]
    for col_name, col_type in columns:
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
        except sqlite3.OperationalError:
            pass # Column already exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            lat REAL,
            lng REAL,
            photo TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS leaves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            reason TEXT,
            attachment TEXT,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS holidays (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE UNIQUE NOT NULL,
            name TEXT NOT NULL,
            type TEXT DEFAULT 'public'
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS payslips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            month TEXT NOT NULL,
            year INTEGER NOT NULL,
            pdf_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Seed Admin
    admin_mobile = '7095011268'
    cursor.execute('SELECT * FROM users WHERE mobile = ?', (admin_mobile,))
    if not cursor.fetchone():
        cursor.execute('INSERT INTO users (mobile, name, role) VALUES (?, ?, ?)', (admin_mobile, 'Admin', 'admin'))
    
    conn.commit()
    conn.close()

try:
    init_db()
except Exception as e:
    logger.error(f"Failed to initialize database: {e}")

# Models
class LoginRequest(BaseModel):
    mobile: str

class StaffCreate(BaseModel):
    mobile: str
    name: str
    email: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    join_date: Optional[str] = None
    address: Optional[str] = None
    salary: float = 0

class StatusUpdate(BaseModel):
    status: str

class AttendanceCreate(BaseModel):
    mobile: str
    type: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    photo: Optional[str] = None

class LeaveCreate(BaseModel):
    user_id: int
    type: str
    start_date: str
    end_date: str
    reason: Optional[str] = None
    attachment: Optional[str] = None

class HolidayCreate(BaseModel):
    date: str
    name: str
    type: str = "public"

class PayslipCreate(BaseModel):
    user_id: int
    month: str
    year: int
    pdf_url: str

# Helper for Admin check
async def check_admin(x_requester_id: Optional[str] = Header(None), db: sqlite3.Connection = Depends(get_db)):
    if not x_requester_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    cursor = db.cursor()
    cursor.execute("SELECT role FROM users WHERE id = ?", (x_requester_id,))
    user = cursor.fetchone()
    if not user or user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    return x_requester_id

# Routes
@app.post("/api/login")
async def login(req: LoginRequest, db: sqlite3.Connection = Depends(get_db)):
    try:
        logger.info(f"Login attempt for mobile: {req.mobile}")
        cursor = db.cursor()
        cursor.execute("SELECT * FROM users WHERE mobile = ? AND status = 'active'", (req.mobile,))
        user = cursor.fetchone()
        if user:
            user_dict = dict(user)
            logger.info(f"User found: {user_dict['name']}")
            return user_dict
        logger.warning(f"User not found or inactive: {req.mobile}")
        raise HTTPException(status_code=401, detail="User not found or inactive")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/staff")
async def get_staff(admin_id: str = Depends(check_admin), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE role = 'staff'")
    return [dict(row) for row in cursor.fetchall()]

@app.post("/api/admin/staff")
async def add_staff(staff: StaffCreate, admin_id: str = Depends(check_admin), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute("""
            INSERT INTO users (mobile, name, email, designation, department, join_date, address, role, salary) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'staff', ?)
        """, (staff.mobile, staff.name, staff.email, staff.designation, staff.department, staff.join_date, staff.address, staff.salary))
        db.commit()
        return {"success": True}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Mobile number already exists")

@app.put("/api/admin/staff/{staff_id}")
async def update_staff(staff_id: int, staff: StaffCreate, admin_id: str = Depends(check_admin), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute("""
            UPDATE users 
            SET mobile = ?, name = ?, email = ?, designation = ?, department = ?, join_date = ?, address = ?, salary = ?
            WHERE id = ? AND role = 'staff'
        """, (staff.mobile, staff.name, staff.email, staff.designation, staff.department, staff.join_date, staff.address, staff.salary, staff_id))
        db.commit()
        return {"success": True}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Mobile number already exists")
    except Exception as e:
        logger.error(f"Update staff error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/api/admin/staff/{staff_id}/status")
async def update_staff_status(staff_id: int, update: StatusUpdate, admin_id: str = Depends(check_admin), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("UPDATE users SET status = ? WHERE id = ?", (update.status, staff_id))
    db.commit()
    return {"success": True}

@app.delete("/api/admin/staff/{staff_id}")
async def delete_staff(staff_id: int, admin_id: str = Depends(check_admin), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM attendance WHERE user_id = ?", (staff_id,))
    cursor.execute("DELETE FROM leaves WHERE user_id = ?", (staff_id,))
    cursor.execute("DELETE FROM payslips WHERE user_id = ?", (staff_id,))
    cursor.execute("DELETE FROM users WHERE id = ? AND role = 'staff'", (staff_id,))
    db.commit()
    return {"success": True}

@app.post("/api/attendance")
async def punch(punch: AttendanceCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id FROM users WHERE mobile = ?", (punch.mobile,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute("INSERT INTO attendance (user_id, type, lat, lng, photo) VALUES (?, ?, ?, ?, ?)",
                   (user['id'], punch.type, punch.lat, punch.lng, punch.photo))
    db.commit()
    return {"success": True}

@app.get("/api/attendance/{type}/{user_id}")
async def get_attendance(type: str, user_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    date_str = "date('now', 'localtime')" if type == 'today' else "date('now', 'localtime', '-1 day')"
    cursor.execute(f"""
        SELECT * FROM attendance 
        WHERE user_id = ? 
        AND date(timestamp) = {date_str}
        ORDER BY timestamp DESC
    """, (user_id,))
    return [dict(row) for row in cursor.fetchall()]

@app.get("/api/admin/reports")
async def get_reports(staffId: str = 'all', filter: str = '30days', admin_id: str = Depends(check_admin), db: sqlite3.Connection = Depends(get_db)):
    query = """
        SELECT a.id, a.type, a.timestamp, a.lat, a.lng, a.photo, u.name, u.mobile 
        FROM attendance a
        JOIN users u ON a.user_id = u.id
    """
    conditions = []
    params = []

    if staffId != 'all':
        conditions.append("a.user_id = ?")
        params.append(staffId)

    if filter == 'today':
        conditions.append("date(a.timestamp) = date('now', 'localtime')")
    elif filter == 'month':
        conditions.append("date(a.timestamp) >= date('now', 'start of month')")
    else:
        conditions.append("date(a.timestamp) >= date('now', '-30 days')")

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    query += " ORDER BY a.timestamp DESC"
    
    cursor = db.cursor()
    cursor.execute(query, params)
    return [dict(row) for row in cursor.fetchall()]

@app.get("/api/leaves/{user_id}")
async def get_user_leaves(user_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    return [dict(row) for row in cursor.fetchall()]

@app.post("/api/leaves")
async def submit_leave(leave: LeaveCreate, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO leaves (user_id, type, start_date, end_date, reason, attachment) VALUES (?, ?, ?, ?, ?, ?)",
                       (leave.user_id, leave.type, leave.start_date, leave.end_date, leave.reason, leave.attachment))
        db.commit()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/admin/leaves")
async def get_admin_leaves(admin_id: str = Depends(check_admin), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("""
        SELECT l.*, u.name, u.mobile 
        FROM leaves l 
        JOIN users u ON l.user_id = u.id 
        ORDER BY l.created_at DESC
    """)
    return [dict(row) for row in cursor.fetchall()]

@app.patch("/api/admin/leaves/{leave_id}")
async def update_leave_status(leave_id: int, update: StatusUpdate, admin_id: str = Depends(check_admin), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("UPDATE leaves SET status = ? WHERE id = ?", (update.status, leave_id))
    db.commit()
    return {"success": True}

@app.get("/api/holidays")
async def get_holidays(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM holidays ORDER BY date ASC")
    return [dict(row) for row in cursor.fetchall()]

@app.post("/api/admin/holidays")
async def add_holiday(holiday: HolidayCreate, admin_id: str = Depends(check_admin), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute("INSERT INTO holidays (date, name, type) VALUES (?, ?, ?)", 
                       (holiday.date, holiday.name, holiday.type))
        db.commit()
        return {"success": True}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Holiday already exists for this date")

@app.delete("/api/admin/holidays/{holiday_id}")
async def delete_holiday(holiday_id: int, admin_id: str = Depends(check_admin), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("DELETE FROM holidays WHERE id = ?", (holiday_id,))
    db.commit()
    return {"success": True}

@app.get("/api/admin/summary")
async def get_admin_summary(admin_id: str = Depends(check_admin), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    
    cursor.execute("SELECT * FROM users WHERE role = 'staff' AND status = 'active'")
    all_staff = [dict(row) for row in cursor.fetchall()]
    
    cursor.execute("""
        SELECT DISTINCT user_id FROM attendance 
        WHERE date(timestamp) = date('now', 'localtime') AND type = 'IN'
    """)
    present_today = [row['user_id'] for row in cursor.fetchall()]
    
    cursor.execute("""
        SELECT DISTINCT user_id FROM leaves 
        WHERE status = 'approved' 
        AND date('now', 'localtime') BETWEEN date(start_date) AND date(end_date)
    """)
    on_leave_today = [row['user_id'] for row in cursor.fetchall()]

    present_ids = set(present_today)
    leave_ids = set(on_leave_today)

    summary = {
        "present": len(present_ids),
        "onLeave": len(leave_ids),
        "absent": len(all_staff) - len(present_ids) - len(leave_ids),
        "total": len(all_staff),
        "presentList": [s for s in all_staff if s['id'] in present_ids],
        "onLeaveList": [s for s in all_staff if s['id'] in leave_ids],
        "absentList": [s for s in all_staff if s['id'] not in present_ids and s['id'] not in leave_ids]
    }
    return summary

@app.get("/api/payslips/{user_id}")
async def get_user_payslips(user_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM payslips WHERE user_id = ? ORDER BY year DESC, month DESC", (user_id,))
    return [dict(row) for row in cursor.fetchall()]

@app.post("/api/admin/payslips")
async def upload_payslip(payslip: PayslipCreate, admin_id: str = Depends(check_admin), db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("INSERT INTO payslips (user_id, month, year, pdf_url) VALUES (?, ?, ?, ?)",
                   (payslip.user_id, payslip.month, payslip.year, payslip.pdf_url))
    db.commit()
    return {"success": True}

# Serve static files in production
if os.path.exists("dist"):
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Skip API routes
        if full_path.startswith("api/"):
            return JSONResponse(status_code=404, content={"error": "Not Found"})
            
        # Check if the requested path is an actual file (like /assets/main.js)
        file_path = os.path.join("dist", full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise, serve index.html for SPA routing
        return FileResponse("dist/index.html")
else:
    @app.get("/")
    async def root():
        return {"message": "Backend is running. Frontend 'dist' folder not found. Run 'npm run build' first."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
