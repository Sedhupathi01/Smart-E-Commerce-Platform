from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from ...db.db import get_db
from ...models.models import Order, Product, User, Category, Notification
from .auth import get_current_user

router = APIRouter()

def verify_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin" and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    total_users = db.query(User).count()
    total_sales = db.query(func.sum(Order.total_amount)).scalar() or 0
    total_orders = db.query(Order).count()
    total_products = db.query(Product).count()

    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    
    return {
        "stats": {
            "users": total_users,
            "sales": float(total_sales),
            "orders": total_orders,
            "products": total_products
        },
        "recent_orders": [
            {
                "id": o.id,
                "amount": float(o.total_amount),
                "status": o.order_status,
                "created_at": o.created_at
            } for o in recent_orders
        ]
    }

@router.get("/users")
def get_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "email": u.email, "role": u.role} for u in users]

@router.get("/products")
def get_products(
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    prods = db.query(Product).all()
    return [{"id": p.id, "name": p.name, "price": float(p.price), "stock": p.stock} for p in prods]

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(404, "Product not found")
    db.delete(prod)
    db.commit()
    return {"message": "Success"}

@router.get("/orders")
def get_all_orders(
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    orders = db.query(Order).all()
    return [{
        "id": o.id,
        "total": float(o.total_amount),
        "status": o.order_status,
        "payment": o.payment_status,
        "user_id": o.user_id,
        "date": o.created_at
    } for o in orders]

@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status_update: Dict[str, str],
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(404, "Order not found")
    order.order_status = status_update.get("status", order.order_status)
    db.commit()
    
    # Create Notification for User
    notification = Notification(
        user_id=order.user_id,
        message=f"Order #{order.id} status updated to: {order.order_status}"
    )
    db.add(notification)
    db.commit()
    
    return {"message": "Success"}

@router.get("/categories")
def get_categories(
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    cats = db.query(Category).all()
    return [{"id": c.id, "name": c.name} for c in cats]

@router.post("/products")
def create_product(
    prod_data: Dict[str, Any],
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    import uuid
    slug = prod_data.get("name", "").lower().replace(" ", "-") + "-" + str(uuid.uuid4())[:4]
    new_prod = Product(
        name=prod_data.get("name"),
        slug=slug,
        description=prod_data.get("description"),
        price=prod_data.get("price"),
        stock=prod_data.get("stock", 0),
        category_id=prod_data.get("category_id"),
        image=prod_data.get("image")
    )
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)
    return new_prod

@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role_update: Dict[str, str],
    db: Session = Depends(get_db),
    admin_user: User = Depends(verify_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    user.role = role_update.get("role", user.role)
    db.commit()
    return {"message": "Success"}
