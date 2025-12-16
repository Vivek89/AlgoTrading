"""
Migration script to add risk_management column to strategies table
Sprint 6: Advanced Risk Management Engine
"""
import sqlite3
import sys
from pathlib import Path

# Database path
DB_PATH = Path(__file__).parent / "algo_trading.db"

def run_migration():
    """Add risk_management column to user_strategies table"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(strategies)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'risk_management' in columns:
            print("✓ Column 'risk_management' already exists in strategies table")
            conn.close()
            return
        
        # Add the column
        print("Adding 'risk_management' column to strategies table...")
        cursor.execute("""
            ALTER TABLE strategies 
            ADD COLUMN risk_management TEXT
        """)
        
        conn.commit()
        print("✓ Successfully added 'risk_management' column")
        
        # Verify the column was added
        cursor.execute("PRAGMA table_info(strategies)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'risk_management' in columns:
            print("✓ Migration verified successfully")
        else:
            print("✗ Migration verification failed")
            sys.exit(1)
        
        conn.close()
        
    except Exception as e:
        print(f"✗ Migration failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
