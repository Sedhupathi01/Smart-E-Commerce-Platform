import os
import sys
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the backend-api directory to the path so we can import our models
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend-api'))

from datetime import datetime
from app.models.models import Category, Product, User
from app.db.db import engine, SessionLocal
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def seed_data():
    db = SessionLocal()
    try:
        # 1. Create Admin User
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@aura.io",
                password=pwd_context.hash("admin123"),
                role="admin",
                is_staff=True,
                is_superuser=True,
                is_active=True,
                first_name="",
                last_name="",
                date_joined=datetime.now(),
                address=""
            )
            db.add(admin)
            print("Admin user created: admin / admin123")
        
        # 2. Create Categories
        electronics = db.query(Category).filter(Category.slug == "electronics").first()
        if not electronics:
            electronics = Category(name="Electronics", slug="electronics", description="")
            db.add(electronics)
        
        lifestyle = db.query(Category).filter(Category.slug == "lifestyle").first()
        if not lifestyle:
            lifestyle = Category(name="Lifestyle", slug="lifestyle", description="")
            db.add(lifestyle)
            
        db.commit()

        # 3. Create Products
        if db.query(Product).count() == 0:
            products = [
                Product(
                    name="Aura Pro Headphones",
                    slug="aura-pro-headphones",
                    description="Premium noise-cancelling headphones for an immersive experience.",
                    price=299.99,
                    stock=50,
                    category_id=electronics.id,
                    image="",
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                ),
                Product(
                    name="Smart Workspace Lamp",
                    slug="smart-workspace-lamp",
                    description="Intelligent lighting that adjusts to your productivity needs.",
                    price=129.50,
                    stock=100,
                    category_id=lifestyle.id,
                    image="",
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                ),
            ]
            db.add_all(products)
            db.commit()
            print("Catalog seeded with initial products.")
        
        print("Seeding completed successfully.")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
