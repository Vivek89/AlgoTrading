"""
Migration script to add theme_preference column to users table
"""
from app.core.database import engine
from sqlalchemy import text

def run_migration():
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("PRAGMA table_info(users)"))
        columns = [row[1] for row in result]
        
        if 'theme_preference' not in columns:
            # Add theme_preference column
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN theme_preference VARCHAR(10) DEFAULT 'dark'
            """))
            conn.commit()
            print("✓ Theme preference column added successfully")
        else:
            print("✓ Theme preference column already exists")

if __name__ == "__main__":
    run_migration()
