from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ...db.db import get_db
from ...models.models import Cart, CartItem, Product, User
from ...schemas.schemas import CartResponseSchema, CartItemSchema
from .auth import get_current_user

router = APIRouter()

@router.get("/", response_model=CartResponseSchema)
def get_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id, created_at=datetime.utcnow())
        db.add(cart)
        db.commit()
        db.refresh(cart)
    
    items_response = []
    for item in cart.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            items_response.append({
                "product_id": product.id,
                "name": product.name,
                "price": float(product.price),
                "image": product.image,
                "quantity": item.quantity
            })
            
    return {"items": items_response}

@router.post("/add")
def add_to_cart(
    item_data: CartItemSchema, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id, created_at=datetime.utcnow())
        db.add(cart)
        db.commit()
        db.refresh(cart)

    existing_item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == item_data.product_id).first()
    if existing_item:
        existing_item.quantity += item_data.quantity
    else:
        new_item = CartItem(cart_id=cart.id, product_id=item_data.product_id, quantity=item_data.quantity)
        db.add(new_item)
    
    db.commit()
    return {"message": "Item added to cart"}

@router.put("/update/{product_id}")
def update_cart_item(
    product_id: int,
    quantity_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not in cart")
        
    new_quantity = quantity_data.get("quantity", item.quantity)
    if new_quantity <= 0:
        db.delete(item)
    else:
        item.quantity = new_quantity
        
    db.commit()
    return {"message": "Cart updated"}

@router.delete("/remove/{product_id}")
def remove_from_cart(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
        
    item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id).first()
    if item:
        db.delete(item)
        db.commit()
        
    return {"message": "Item removed"}
