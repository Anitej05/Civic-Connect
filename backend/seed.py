import os
import sys
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# This ensures that the script can find the other backend modules
# when run from the repository root.
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.connection import SQLALCHEMY_DATABASE_URL, Base
from database.models import User
from security import get_password_hash

# --- Configuration ---
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "adminpassword" # WARNING: Use a secure, environment-managed password in production

# --- Database Setup ---
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_database():
    """
    Initializes the database and creates the first admin user if one does not exist.
    """
    print("--- Seeding Database ---")

    # Create tables if they don't exist
    print("Ensuring all database tables are created...")
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

    db = SessionLocal()

    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.email == ADMIN_EMAIL).first()

        if not admin_user:
            print(f"Admin user not found. Creating user: {ADMIN_EMAIL}")
            hashed_password = get_password_hash(ADMIN_PASSWORD)
            db_admin = User(
                email=ADMIN_EMAIL,
                hashed_password=hashed_password,
                role="admin"
            )
            db.add(db_admin)
            db.commit()
            print("Admin user created successfully.")
            print(f"Email: {ADMIN_EMAIL}")
            print(f"Password: {ADMIN_PASSWORD}")
        else:
            print("Admin user already exists. No action taken.")

    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        db.rollback()
    finally:
        db.close()

    print("--- Seeding Complete ---")

if __name__ == "__main__":
    seed_database()
