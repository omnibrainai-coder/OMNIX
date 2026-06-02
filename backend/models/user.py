import sqlite3

DB_NAME = "database/users.db"

def create_users_table():
    conn = sqlite3.connect(DB_NAME)

    conn.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unique_id TEXT UNIQUE,
        username TEXT UNIQUE,
        mobile TEXT UNIQUE,
        bio TEXT,
        profile_pic TEXT,
        followers INTEGER DEFAULT 0,
        following INTEGER DEFAULT 0,
        streak INTEGER DEFAULT 0,
        omni_score REAL DEFAULT 0
    )
    """)

    conn.commit()
    conn.close()

create_users_table()
