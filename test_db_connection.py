"""
Test PostgreSQL database connection.
Run this script to verify your database connection is working.
"""
import sys
import os

# Add project root to Python path
project_root = os.path.abspath(os.path.dirname(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

def test_connection():
    """Test database connection."""
    print("Testing PostgreSQL connection...")
    print("-" * 60)
    
    try:
        from app.database.connection import engine, SessionLocal
        from app.database.models import Base
        from sqlalchemy import text
        
        # Test 1: Check connection string
        from app.config import DATABASE_URL
        print(f"✓ Connection string loaded: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'hidden'}")
        
        # Test 2: Try to connect
        print("\nTesting connection...")
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✓ Connected successfully!")
            print(f"  PostgreSQL version: {version.split(',')[0]}")
        
        # Test 3: Test session
        print("\nTesting database session...")
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            print("✓ Session works correctly")
        finally:
            db.close()
        
        # Test 4: Check if tables exist
        print("\nChecking database tables...")
        from sqlalchemy import inspect
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        if existing_tables:
            print(f"✓ Found {len(existing_tables)} table(s):")
            for table in existing_tables:
                print(f"  - {table}")
        else:
            print("⚠ No tables found (will be created on first server start)")
        
        # Test 5: Create tables (optional)
        print("\n" + "-" * 60)
        response = input("Create database tables now? (y/n): ").strip().lower()
        if response == 'y':
            print("Creating tables...")
            Base.metadata.create_all(bind=engine)
            print("✓ Tables created successfully!")
            
            # Verify tables were created
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            print(f"\n✓ Database now has {len(tables)} table(s):")
            for table in tables:
                print(f"  - {table}")
        
        print("\n" + "=" * 60)
        print("✅ All tests passed! Database connection is working.")
        print("=" * 60)
        return True
        
    except Exception as e:
        print("\n" + "=" * 60)
        print("❌ Connection failed!")
        print("=" * 60)
        print(f"Error: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Check if PostgreSQL is running")
        print("2. Verify DATABASE_URL in .env file")
        print("3. Make sure database 'weather_cloth_rec' exists")
        print("4. Check username/password are correct")
        return False


if __name__ == "__main__":
    test_connection()

