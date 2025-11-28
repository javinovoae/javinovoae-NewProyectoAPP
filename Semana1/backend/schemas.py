from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any 
from datetime import datetime, date 


# login 
class UserLogin(BaseModel):
    username: str
    password: str 

class LoginResponse(BaseModel): 
    message: str
    user_id: int
    username: str
    name: Optional[str] = None     
    lastname: Optional[str] = None
    latitude: Optional[float] = None  
    longitude: Optional[float] = None 

    class Config:
        from_attributes = True 


#perfil del usuario 

class UserBase(BaseModel):
    username: str
    is_active: bool = True
    name: Optional[str] = None
    lastname: Optional[str] = None
    education: Optional[str] = None
    birthdate: Optional[str] = None 
    latitude: Optional[float] = None  
    longitude: Optional[float] = None 

class UserCreate(UserBase): 
    password: str 


class UserProfileUpdate(BaseModel): 
    name: Optional[str] = None
    lastname: Optional[str] = None
    education: Optional[str] = None
    birthdate: Optional[str] = None
    is_active: Optional[bool] = None
    latitude: Optional[float] = None  
    longitude: Optional[float] = None 

#lectura
class UserProfile(UserBase): 
    id: int
    events_managed: List['Event'] = []
    tickets_bought: List['Ticket'] = []
    model_config = ConfigDict(from_attributes=True)


class UserInEvent(BaseModel):
    id: int
    name: Optional[str] = None
    lastname: Optional[str] = None
    username: str
    model_config = ConfigDict(from_attributes=True, extra='ignore')

class EventCreate(BaseModel):
    name: str
    manager_id: int
    event_date: str
    
class Event(BaseModel):
    id: int 
    name: str
    manager_id: int 
    event_date: str
    manager: UserInEvent 
    total_earnings: int = 0
    model_config = ConfigDict(from_attributes=True)

# Schema para la creación de un producto
class ProductCreate(BaseModel):
    name: str
    price: int
    user_id: int
    is_available: bool = True

# Schema para el item de stock de evento 
class StockEventCreate(BaseModel):
    event_id: int
    product_id: int
    quantity_stock_event: int
    prod_price_event: int


# --- Lectura  ---

class Product(BaseModel):
    id: int
    name: str
    price: int
    is_available: bool

    model_config = ConfigDict(from_attributes=True)

class CantidadTicket(BaseModel): 
    id: int 
    ticket_id: int 
    product_id: int
    cantidad_prod_ticket: int
    product_obj_ticket: Product

    
    model_config = ConfigDict(from_attributes=True)
# Schema para el item de cantidad de ticket 
class CantidadTicketCreate(BaseModel):
    product_id: int
    cantidad_prod_ticket: int = 1
    
    # Schema para la creación de un ticket 
class TicketCreate(BaseModel):
    buyer_id: int
    event_id: int
    ticket_items: List['CantidadTicketCreate'] = []


# Schema de lectura para Ticket
class Ticket(BaseModel): 
    id: int 
    sale_date: datetime 
    price_ticket: int 
    buyer_id: int 
    event_id: int 

    ticket_items: List[CantidadTicket] = []

    model_config = ConfigDict(from_attributes=True)



# Schema para el item de stock de evento (respuesta)
class StockEvent(StockEventCreate):
    id: int
    product: ProductCreate

    model_config = ConfigDict(from_attributes=True)



# Esquema completo de usuario para respuesta
class User(UserBase): 
    id: int 
    events_managed: List[Event] = [] 
    tickets_bought: List[Ticket] = [] 
    
    model_config = ConfigDict(from_attributes=True)

