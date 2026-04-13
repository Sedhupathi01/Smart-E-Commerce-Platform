from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class User(Base):
    __tablename__ = "core_user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), unique=True, index=True)
    email = Column(String(254), unique=True, index=True)
    password = Column(String(128))
    role = Column(String(20), default="customer")
    phone = Column(String(15), nullable=True)
    address = Column(Text, nullable=True)
    is_staff = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    first_name = Column(String(150), nullable=True)
    last_name = Column(String(150), nullable=True)
    date_joined = Column(DateTime(timezone=True), server_default=func.now())

class Category(Base):
    __tablename__ = "core_category"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    slug = Column(String(100), unique=True, index=True)
    description = Column(Text, nullable=True)
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "core_product"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    slug = Column(String(255), unique=True, index=True)
    description = Column(Text)
    price = Column(Numeric(10, 2))
    stock = Column(Integer, default=0)
    category_id = Column(Integer, ForeignKey("core_category.id"))
    image = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product")

class ProductImage(Base):
    __tablename__ = "core_productimage"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("core_product.id"))
    image = Column(String(255))
    alt_text = Column(String(255), nullable=True)
    
    product = relationship("Product", back_populates="images")

class Order(Base):
    __tablename__ = "core_order"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("core_user.id"))
    total_amount = Column(Numeric(10, 2))
    order_status = Column(String(20), default="processing")
    payment_status = Column(String(20), default="pending")
    stripe_payment_intent_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    address = Column(Text)
    
    user = relationship("User")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "core_orderitem"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("core_order.id"))
    product_id = Column(Integer, ForeignKey("core_product.id"))
    quantity = Column(Integer)
    price = Column(Numeric(10, 2))
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class Cart(Base):
    __tablename__ = "core_cart"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("core_user.id"), unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    items = relationship("CartItem", back_populates="cart")

class CartItem(Base):
    __tablename__ = "core_cartitem"
    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("core_cart.id"))
    product_id = Column(Integer, ForeignKey("core_product.id"))
    quantity = Column(Integer, default=1)
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")

class Notification(Base):
    __tablename__ = "core_notification"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("core_user.id"))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    
    user = relationship("User")
