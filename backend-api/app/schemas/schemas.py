from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""

class UserProfile(BaseModel):
    id: int
    username: str
    email: str
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True

class ProductSchema(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    price: Decimal
    stock: int
    category_id: int
    image: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class CartItemSchema(BaseModel):
    product_id: int
    quantity: int

class CartItemResponseSchema(CartItemSchema):
    name: Optional[str] = None
    price: Optional[float] = 0.0
    image: Optional[str] = None

class CartSchema(BaseModel):
    items: List[CartItemSchema]

class CartResponseSchema(BaseModel):
    items: List[CartItemResponseSchema]

class OrderCreateSchema(BaseModel):
    items: List[CartItemSchema]
    address: str

class OrderSchema(BaseModel):
    id: int
    total_amount: Decimal
    order_status: str
    payment_status: str
    created_at: datetime
    address: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str

class TokenData(BaseModel):
    username: Optional[str] = None

class NotificationSchema(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
