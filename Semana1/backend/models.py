# backend/models.py
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, UniqueConstraint, Numeric # <--- Asegúrate de añadir Numeric aquí
from sqlalchemy.orm import relationship
from datetime import datetime, timezone 
from backend.database import Base 

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    name = Column(String, nullable=True) 
    lastname = Column(String, nullable=True)
    education = Column(String, nullable=True)
    birthdate = Column(String, nullable=True) 
    latitude = Column(Numeric(precision=9, scale=6), nullable=True) 
    longitude = Column(Numeric(precision=9, scale=6), nullable=True) 


    # Relaciones: 
    events_managed = relationship("Event", back_populates="manager")
    tickets_bought = relationship("Ticket", back_populates="buyer")
    products_owned = relationship("Product", backref="owner")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True) 
    event_date = Column(String) 
    total_earnings = Column(Integer, default=0)

    manager_id = Column(Integer, ForeignKey("users.id")) 
    manager = relationship("User", back_populates="events_managed")

    # Relación M2M con Product a través de StockEvent
    products_in_stock_event = relationship("StockEvent", back_populates="event_obj") 
    
    event_tickets = relationship("Ticket", back_populates="event_obj") 


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Integer)
    is_available = Column(Boolean, default=True)

    # Relación M2M con Event a través de StockEvent
    product_stocks = relationship("StockEvent", back_populates="product_obj")
    # Relación M2M con Ticket a través de CantidadTicket
    product_ticket_items = relationship("CantidadTicket", back_populates="product_obj_ticket")
    user_id = Column(Integer, ForeignKey("users.id"))


# Tabla intermedia entre Event y Product
class StockEvent(Base):
    __tablename__ = "stock_event"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity_stock_event = Column(Integer)
    prod_price_event = Column(Integer) 

    event_obj = relationship("Event", back_populates="products_in_stock_event")
    product_obj = relationship("Product", back_populates="product_stocks")


class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    price_ticket = Column(Integer, nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    sale_date = Column(DateTime, default=datetime.utcnow) 

    buyer = relationship("User", back_populates="tickets_bought")
    event_obj = relationship("Event", back_populates="event_tickets") 
    
    # Relación M2M con Product a través de CantidadTicket
    ticket_items = relationship("CantidadTicket", back_populates="ticket_obj")


# Tabla intermedia entre Ticket y Product
class CantidadTicket(Base):
    __tablename__ = "cantidad_ticket"
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id")) 
    product_id = Column(Integer, ForeignKey("products.id")) 
    cantidad_prod_ticket = Column(Integer, default=1)

    ticket_obj = relationship("Ticket", back_populates="ticket_items")
    product_obj_ticket = relationship("Product", back_populates="product_ticket_items")

