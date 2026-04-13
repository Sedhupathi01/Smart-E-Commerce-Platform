from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ...db.db import get_db
from ...models.models import Product, Category
from ...schemas.schemas import ProductSchema
from decimal import Decimal

router = APIRouter()

@router.get("/", response_model=List[ProductSchema])
def list_products(
    db: Session = Depends(get_db), 
    category_id: Optional[int] = None, 
    min_price: Optional[Decimal] = None, 
    max_price: Optional[Decimal] = None,
    search: Optional[str] = None
):
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if min_price:
        query = query.filter(Product.price >= min_price)
    if max_price:
        query = query.filter(Product.price <= max_price)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    
    return query.all()

@router.get("/{product_id}", response_model=ProductSchema)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
