from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ...db.db import get_db
from ...models.models import Order, OrderItem, Product, User, Notification
from ...schemas.schemas import OrderCreateSchema, OrderSchema
from .auth import get_current_user
import stripe
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock")

router = APIRouter()

@router.post("/", response_model=OrderSchema)
async def create_order(
    order_data: OrderCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_amount = 0
    items_to_create = []

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product or product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} is unavailable or out of stock")
        
        total_amount += product.price * item.quantity
        items_to_create.append(OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price=product.price
        ))
        # Deduct stock
        product.stock -= item.quantity

    # Create Stripe Payment Intent (Mocked for local dev)
    try:
        if stripe.api_key == "sk_test_mock":
            intent_id = "pi_mock_12345"
        else:
            intent = stripe.PaymentIntent.create(
                amount=int(total_amount * 100), # Amount in cents
                currency="usd",
                metadata={"user_id": current_user.id}
            )
            intent_id = intent.id
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Stripe Error: {str(e)}")

    new_order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        order_status="processing",
        payment_status="pending",
        stripe_payment_intent_id=intent_id,
        address=order_data.address,
        created_at=datetime.utcnow()
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Link items to order
    for item in items_to_create:
        item.order_id = new_order.id
        db.add(item)
    
    db.commit()
    db.refresh(new_order)

    # Create Notification
    notification = Notification(
        user_id=current_user.id,
        message=f"Your Aura order #{new_order.id} has been successfully placed!",
        created_at=datetime.utcnow()
    )
    db.add(notification)
    db.commit()

    return new_order

@router.get("/", response_model=List[OrderSchema])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Order).filter(Order.user_id == current_user.id).all()
