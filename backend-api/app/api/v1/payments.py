import stripe
import json
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime
import os
from ...db.db import get_db
from ...models.models import Order, OrderItem, Product, User, Cart, CartItem, Notification, Payment
from .auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

class PaymentIntentRequest(BaseModel):
    items: list
    address: str

@router.post("/create-payment-intent")
async def create_payment_intent(
    req: PaymentIntentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Validate amount on backend
        total_amount = 0.0
        real_items_data = []

        for item in req.items:
            product = db.query(Product).filter(Product.id == item["product_id"]).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item['product_id']} not found")
            if product.stock < item["quantity"]:
                raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}")
            
            total_amount += float(product.price) * item["quantity"]
            real_items_data.append({
                "product_id": product.id,
                "quantity": item["quantity"],
                "price": float(product.price)
            })

        # Create Stripe PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=int(total_amount * 100),  # Amount in cents
            currency="usd",
            metadata={
                "user_id": current_user.id,
                "address": req.address,
                "items": json.dumps(req.items)
            }
        )

        return {"client_secret": intent.client_secret}

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        else:
            # For testing without webhook secret
            event = json.loads(payload)
            
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        
        metadata = payment_intent.get('metadata', {})
        user_id = int(metadata.get('user_id'))
        address = metadata.get('address')
        items = json.loads(metadata.get('items', '[]'))
        amount = payment_intent.get('amount') / 100.0
        transaction_id = payment_intent.get('id')

        # Check if already processed
        existing_payment = db.query(Payment).filter(Payment.transaction_id == transaction_id).first()
        if existing_payment:
            return {"status": "already processed"}

        user = db.query(User).filter(User.id == user_id).first()
        
        # 1. Create order
        new_order = Order(
            user_id=user_id,
            total_amount=amount,
            order_status="processing",
            payment_status="success",
            stripe_payment_intent_id=transaction_id,
            address=address,
            created_at=datetime.utcnow()
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        
        # 2. Add Payment record
        new_payment = Payment(
            order_id=new_order.id,
            user_id=user_id,
            amount=amount,
            payment_method="Stripe",
            transaction_id=transaction_id,
            status="success"
        )
        db.add(new_payment)

        # 3. Handle Order Items and Stock decrement
        for item in items:
            product_id = item['product_id']
            qty = item['quantity']
            product = db.query(Product).filter(Product.id == product_id).first()
            if product:
                # Add item
                order_item = OrderItem(
                    order_id=new_order.id,
                    product_id=product.id,
                    quantity=qty,
                    price=product.price
                )
                db.add(order_item)
                
                # Reduce stock
                product.stock -= qty
                
        # 4. Clear cart
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if cart:
            db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

        # 5. Trigger notification
        notification = Notification(
            user_id=user_id,
            message=f"Your payment was successful and Aura order #{new_order.id} has been placed!",
            created_at=datetime.utcnow()
        )
        db.add(notification)
        
        db.commit()
        
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        metadata = payment_intent.get('metadata', {})
        user_id = int(metadata.get('user_id'))
        transaction_id = payment_intent.get('id')
        amount = payment_intent.get('amount') / 100.0
        
        new_payment = Payment(
            order_id=None,
            user_id=user_id,
            amount=amount,
            payment_method="Stripe",
            transaction_id=transaction_id,
            status="failed"
        )
        db.add(new_payment)
        db.commit()

    return {"status": "success"}
